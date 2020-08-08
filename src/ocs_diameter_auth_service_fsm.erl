%%% ocs_diameter_auth_service_fsm.erl
%%% vim: ts=3
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%% @copyright 2016 - 2017 SigScale Global Inc.
%%% @end
%%% Licensed under the Apache License, Version 2.0 (the "License");
%%% you may not use this file except in compliance with the License.
%%% You may obtain a copy of the License at
%%%
%%%     http://www.apache.org/licenses/LICENSE-2.0
%%%
%%% Unless required by applicable law or agreed to in writing, software
%%% distributed under the License is distributed on an "AS IS" BASIS,
%%% WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
%%% See the License for the specific language governing permissions and
%%% limitations under the License.
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%% @doc This {@link //stdlib/gen_fsm. gen_fsm} behaviour callback
%%% 	module implements functions to subscribe to a {@link //diameter. diameter}
%%% 	service and to react to events sent by {@link //diameter. diameter} service.
%%%
%%% @reference <a href="https://tools.ietf.org/pdf/rfc6733.pdf">
%%% 	RFC6733 - DIAMETER base protocol</a>
%%%
%%% @reference <a href="https://tools.ietf.org/pdf/rfc7155.pdf">
%%% 	RFC7155 - DIAMETER Network Access Server Application</a>
%%%
%%% @reference <a href="https://tools.ietf.org/pdf/rfc4072.pdf">
%%% 	RFC4072 - DIAMETER Extensible Authentication Protocol (EAP) Application</a>
%%%
-module(ocs_diameter_auth_service_fsm).
-copyright('Copyright (c) 2016 - 2017 SigScale Global Inc.').

-behaviour(gen_fsm).

%% export the ocs_diameter_auth_service_fsm API
-export([]).

%% export the ocs_diameter_auth_service_fsm state callbacks
-export([wait_for_start/2, started/2, wait_for_stop/2]).

%% export the call backs needed for gen_fsm behaviour
-export([init/1, handle_event/3, handle_sync_event/4, handle_info/3,
			terminate/3, code_change/4]).

-include_lib("diameter/include/diameter.hrl").
-include_lib("kernel/include/inet.hrl").
-include_lib("diameter/include/diameter_gen_base_rfc6733.hrl").

-record(statedata,
		{transport_ref :: undefined | reference(),
		address :: inet:ip_address(),
		port :: inet:port_number(),
		options :: list()}).

-define(DIAMETER_AUTH_SERVICE(A, P), {ocs_diameter_auth_service, A, P}).
-define(BASE_APPLICATION, ocs_diameter_base_application).
-define(BASE_APPLICATION_ID, 0).
-define(BASE_APPLICATION_DICT, diameter_gen_base_rfc6733).
-define(BASE_APPLICATION_CALLBACK, ocs_diameter_base_application_cb).
-define(NAS_APPLICATION, ocs_diameter_nas_application).
-define(NAS_APPLICATION_ID, 1).
-define(NAS_APPLICATION_DICT, diameter_gen_nas_application_rfc7155).
-define(NAS_APPLICATION_CALLBACK, ocs_diameter_nas_application_cb).
-define(EAP_APPLICATION, ocs_diameter_eap_application).
-define(EAP_APPLICATION_ID, 5).
-define(EAP_APPLICATION_DICT, diameter_gen_eap_application_rfc4072).
-define(EAP_APPLICATION_CALLBACK, ocs_diameter_eap_application_cb).
-define(STa_APPLICATION, ocs_diameter_3gpp_sta_application).
-define(STa_APPLICATION_ID, 16777250).
-define(STa_APPLICATION_DICT, diameter_gen_3gpp_sta_application).
-define(STa_APPLICATION_CALLBACK, ocs_diameter_3gpp_sta_application_cb).
-define(SWm_APPLICATION, ocs_diameter_3gpp_swm_application).
-define(SWm_APPLICATION_ID, 16777264).
-define(SWm_APPLICATION_DICT, diameter_gen_3gpp_swm_application).
-define(SWm_APPLICATION_CALLBACK, ocs_diameter_3gpp_swm_application_cb).
-define(SWx_APPLICATION, ocs_diameter_3gpp_swx_application).
-define(SWx_APPLICATION_ID, 16777265).
-define(SWx_APPLICATION_DICT, diameter_gen_3gpp_swx_application).
-define(SWx_APPLICATION_CALLBACK, ocs_diameter_3gpp_swx_application_cb).
-define(S6a_APPLICATION, ocs_diameter_3gpp_s6a_application).
-define(S6a_APPLICATION_ID, 16777251).
-define(S6a_APPLICATION_DICT, diameter_gen_3gpp_s6a_application).
-define(S6a_APPLICATION_CALLBACK, ocs_diameter_3gpp_s6a_application_cb).
-define(IANA_PEN_3GPP, 10415).
-define(IANA_PEN_SigScale, 50386).

%%----------------------------------------------------------------------
%%  The ocs_diameter_auth_service_fsm API
%%----------------------------------------------------------------------

%%----------------------------------------------------------------------
%%  The ocs_diameter_auth_service_fsm gen_fsm call backs
%%----------------------------------------------------------------------

-spec init(Args) -> Result
	when
		Args :: list(),
		Result :: {ok, StateName, StateData}
			| {ok, StateName, StateData, Timeout}
			| {ok, StateName, StateData, hibernate}
			| {stop, Reason} | ignore,
		StateName :: atom(),
		StateData :: #statedata{},
		Timeout :: non_neg_integer() | infinity,
		Reason :: term().
%% @doc Initialize the {@module} finite state machine.
%% @see //stdlib/gen_fsm:init/1
%% @private
%%
init([Address, Port, Options] = _Args) ->
	process_flag(trap_exit, true),
	SOptions = service_options(Options),
	TOptions = transport_options(diameter_tcp, Address, Port),
	SvcName = ?DIAMETER_AUTH_SERVICE(Address, Port),
	diameter:subscribe(SvcName),
	case diameter:start_service(SvcName, SOptions) of
		ok ->
			case diameter:add_transport(SvcName, TOptions) of
				{ok, Ref} ->
					StateData = #statedata{transport_ref = Ref, address = Address,
							port = Port, options = Options},
					init1(StateData);
				{error, Reason} ->
					{stop, Reason}
			end;
		{error, Reason} ->
			{stop, Reason}
	end.
%% @hidden
init1(StateData) ->
	case ocs_log:auth_open() of
		ok ->
			process_flag(trap_exit, true),
			{ok, wait_for_start, StateData, 0};
		{error, Reason} ->
			{stop, Reason}
	end.

-spec wait_for_start(Event, StateData) -> Result
	when
		Event :: timeout | term(), 
		StateData :: #statedata{},
		Result :: {next_state, NextStateName, NewStateData}
			| {next_state, NextStateName, NewStateData, Timeout}
			| {next_state, NextStateName, NewStateData, hibernate}
			| {stop, Reason, NewStateData},
		NextStateName :: atom(),
		NewStateData :: #statedata{},
		Timeout :: non_neg_integer() | infinity,
		Reason :: normal | term().
%% @doc Handle events sent with {@link //stdlib/gen_fsm:send_event/2.
%%		gen_fsm:send_event/2} in the <b>wait_for_start</b> state.
%% @@see //stdlib/gen_fsm:StateName/2
%% @private
%%
wait_for_start(timeout, StateData) ->
	{next_state, wait_for_start, StateData}.

-spec started(Event, StateData) -> Result
	when
		Event :: timeout | term(), 
		StateData :: #statedata{},
		Result :: {next_state, NextStateName, NewStateData}
			| {next_state, NextStateName, NewStateData, Timeout}
			| {next_state, NextStateName, NewStateData, hibernate}
			| {stop, Reason, NewStateData},
		NextStateName :: atom(),
		NewStateData :: #statedata{},
		Timeout :: non_neg_integer() | infinity,
		Reason :: normal | term().
%% @doc Handle events sent with {@link //stdlib/gen_fsm:send_event/2.
%%		gen_fsm:send_event/2} in the <b>started</b> state.
%% @@see //stdlib/gen_fsm:StateName/2
%% @private
%%
started(timeout, StateData) ->
	{next_state, started, StateData}.

-spec wait_for_stop(Event, StateData) -> Result
	when
		Event :: timeout | term(), 
		StateData :: #statedata{},
		Result :: {next_state, NextStateName, NewStateData}
			| {next_state, NextStateName, NewStateData, Timeout}
			| {next_state, NextStateName, NewStateData, hibernate}
			| {stop, Reason, NewStateData},
		NextStateName :: atom(),
		NewStateData :: #statedata{},
		Timeout :: non_neg_integer() | infinity,
		Reason :: normal | term().
%% @doc Handle events sent with {@link //stdlib/gen_fsm:send_event/2.
%%		gen_fsm:send_event/2} in the <b>wait_for_stop</b> state.
%% @@see //stdlib/gen_fsm:StateName/2
%% @private
%%
wait_for_stop(timeout, StateData) ->
	{stop, shutdown, StateData}.

-spec handle_event(Event, StateName, StateData) -> Result
	when
		Event :: term(), 
		StateName :: atom(), 
		StateData :: #statedata{},
		Result :: {next_state, NextStateName, NewStateData}
			| {next_state, NextStateName, NewStateData, Timeout}
			| {next_state, NextStateName, NewStateData, hibernate}
			| {stop, Reason , NewStateData},
		NextStateName :: atom(),
		NewStateData :: #statedata{},
		Timeout :: non_neg_integer() | infinity,
		Reason :: normal | term().
%% @doc Handle an event sent with
%% 	{@link //stdlib/gen_fsm:send_all_state_event/2.
%% 	gen_fsm:send_all_state_event/2}.
%% @see //stdlib/gen_fsm:handle_event/3
%% @private
%%
handle_event(_Event, StateName, StateData) ->
	{next_state, StateName, StateData}.

-spec handle_sync_event(Event, From, StateName, StateData) -> Result
	when
		Event :: term(), 
		From :: {Pid :: pid(), Tag :: term()},
		StateName :: atom(), 
		StateData :: #statedata{},
		Result :: {reply, Reply, NextStateName, NewStateData}
			| {reply, Reply, NextStateName, NewStateData, Timeout}
			| {reply, Reply, NextStateName, NewStateData, hibernate}
			| {next_state, NextStateName, NewStateData}
			| {next_state, NextStateName, NewStateData, Timeout}
			| {next_state, NextStateName, NewStateData, hibernate}
			| {stop, Reason, Reply, NewStateData}
			| {stop, Reason, NewStateData},
		Reply :: term(),
		NextStateName :: atom(),
		NewStateData :: #statedata{},
		Timeout :: non_neg_integer() | infinity,
		Reason :: normal | term().
%% @doc Handle an event sent with
%% 	{@link //stdlib/gen_fsm:sync_send_all_state_event/2.
%% 	gen_fsm:sync_send_all_state_event/2,3}.
%% @see //stdlib/gen_fsm:handle_sync_event/4
%% @private
%%
handle_sync_event(_Event, _From, StateName, StateData) ->
	{reply, ok, StateName, StateData}.

-spec handle_info(Info, StateName, StateData) -> Result
	when
		Info :: term(), 
		StateName :: atom(), 
		StateData :: #statedata{},
		Result :: {next_state, NextStateName, NewStateData}
			| {next_state, NextStateName, NewStateData, Timeout}
			| {next_state, NextStateName, NewStateData, hibernate}
			| {stop, Reason, NewStateData},
		NextStateName :: atom(),
		NewStateData :: #statedata{},
		Timeout :: non_neg_integer() | infinity,
		Reason :: normal | term().
%% @doc Handle a received message.
%% @see //stdlib/gen_fsm:handle_info/3
%% @private
%%
handle_info(#diameter_event{info = start}, wait_for_start, StateData) ->
	{next_state, started, StateData};
handle_info(#diameter_event{info = Event, service = Service},
		StateName, StateData) when element(1, Event) == up;
		element(1, Event) == down ->
	{_PeerRef, #diameter_caps{origin_host = {_, Peer}}} = element(3, Event),
	error_logger:info_report(["DIAMETER peer connection state changed",
			{service, Service}, {event, element(1, Event)},
			{peer, binary_to_list(Peer)}]),
	{next_state, StateName, StateData};
handle_info(#diameter_event{info = {watchdog,
		_Ref, _PeerRef, {_From, _To}, _Config}}, StateName, StateData) ->
	{next_state, StateName, StateData};
handle_info(#diameter_event{info = Event, service = Service},
		StateName, StateData) ->
	error_logger:info_report(["DIAMETER event",
			{service, Service}, {event, Event}]),
	{next_state, StateName, StateData};
handle_info({'EXIT', _Pid, noconnection}, StateName, StateData) ->
	{next_state, StateName, StateData}.

-spec terminate(Reason, StateName, StateData) -> any()
	when
		Reason :: normal | shutdown | term(), 
		StateName :: atom(),
		StateData :: #statedata{}.
%% @doc Cleanup and exit.
%% @see //stdlib/gen_fsm:terminate/3
%% @private
%%
terminate(_Reason, _StateName,  #statedata{transport_ref = TransRef,
		address = Address, port = Port}= _StateData) ->
	SvcName = ?DIAMETER_AUTH_SERVICE(Address, Port),
	case diameter:remove_transport(SvcName, TransRef) of
		ok ->
			ocs_log:auth_close(),
			diameter:stop_service(SvcName);
		{error, Reason1} ->
			{error, Reason1}
	end.

-spec code_change(OldVsn, StateName, StateData, Extra) -> Result
	when
		OldVsn :: (Vsn :: term() | {down, Vsn :: term()}),
		StateName :: atom(), 
		StateData :: #statedata{}, 
		Extra :: term(),
		Result :: {ok, NextStateName :: atom(), NewStateData :: #statedata{}}.
%% @doc Update internal state data during a release upgrade&#047;downgrade.
%% @see //stdlib/gen_fsm:code_change/4
%% @private
%%
code_change(_OldVsn, StateName, StateData, _Extra) ->
	{ok, StateName, StateData}.

%%----------------------------------------------------------------------
%%  internal functions
%%----------------------------------------------------------------------

-spec service_options(Options) -> Options
	when
		Options :: list().
%% @doc Returns options for a DIAMETER service
%% @hidden
service_options(Options) ->
	{ok, Vsn} = application:get_key(vsn),
	Version = list_to_integer([C || C <- Vsn, C /= $.]),
	{ok, Hostname} = inet:gethostname(),
	Options1 = lists:keydelete(eap_method_prefer, 1, Options),
	Options2 = lists:keydelete(eap_method_order, 1, Options1),
	Options3 = case lists:keymember('Origin-Host', 1, Options2) of
		true ->
			Options2;
		false when length(Hostname) > 0 ->
			[{'Origin-Host', Hostname} | Options2];
		false ->
			[{'Origin-Host', "ocs"} | Options2]
	end,
	Options4 = case lists:keymember('Origin-Realm', 1, Options3) of
		true ->
			Options3;
		false ->
			OriginRealm = case inet_db:res_option(domain) of
				S when length(S) > 0 ->
					S;
				_ ->
					"example.net"
			end,
			[{'Origin-Realm', OriginRealm} | Options3]
	end,
	Options4 ++ [{'Vendor-Id', ?IANA_PEN_SigScale},
		{'Product-Name', "SigScale AAA"},
		{'Firmware-Revision', Version},
		{'Supported-Vendor-Id',[?IANA_PEN_3GPP]},
		{'Auth-Application-Id',
				[?NAS_APPLICATION_ID, ?EAP_APPLICATION_ID,
				?STa_APPLICATION_ID, ?SWm_APPLICATION_ID,
				?SWx_APPLICATION_ID, ?S6a_APPLICATION_ID]},
		{'Vendor-Specific-Application-Id',
				[#'diameter_base_Vendor-Specific-Application-Id'{
						'Vendor-Id' = ?IANA_PEN_3GPP,
						'Auth-Application-Id' = [?STa_APPLICATION_ID,
								?SWm_APPLICATION_ID, ?SWx_APPLICATION_ID,
								?S6a_APPLICATION_ID]}]},
		{restrict_connections, false},
		{string_decode, false},
		{application,
				[{alias, ?BASE_APPLICATION},
				{dictionary, ?BASE_APPLICATION_DICT},
				{module, ?BASE_APPLICATION_CALLBACK},
				{request_errors, callback}]},
		{application,
				[{alias, ?EAP_APPLICATION},
				{dictionary, ?EAP_APPLICATION_DICT},
				{module, ?EAP_APPLICATION_CALLBACK},
				{request_errors, callback}]},
		{application,
				[{alias, ?NAS_APPLICATION},
				{dictionary, ?NAS_APPLICATION_DICT},
				{module, ?NAS_APPLICATION_CALLBACK},
				{request_errors, callback}]},
		{application,
				[{alias, ?STa_APPLICATION},
				{dictionary, ?STa_APPLICATION_DICT},
				{module, ?STa_APPLICATION_CALLBACK},
				{request_errors, callback}]},
		{application,
				[{alias, ?SWm_APPLICATION},
				{dictionary, ?SWm_APPLICATION_DICT},
				{module, ?SWm_APPLICATION_CALLBACK},
				{request_errors, callback}]},
		{application,
				[{alias, ?SWx_APPLICATION},
				{dictionary, ?SWx_APPLICATION_DICT},
				{module, ?SWx_APPLICATION_CALLBACK},
				{answer_errors, callback},
				{request_errors, callback}]},
		{application,
				[{alias, ?S6a_APPLICATION},
				{dictionary, ?S6a_APPLICATION_DICT},
				{module, ?S6a_APPLICATION_CALLBACK},
				{answer_errors, callback},
				{request_errors, callback}]}].

-spec transport_options(Transport, Address, Port) -> Options
	when
		Transport :: diameter_tcp | diameter_sctp,
		Address :: inet:ip_address(),
		Port :: inet:port_number(),
		Options :: tuple().
%% @doc Returns options for a DIAMETER transport layer
%% @hidden
transport_options(Transport, Address, Port) ->
	Opts = [{transport_module, Transport},
			{transport_config, [{reuseaddr, true},
					{ip, Address},
					{port, Port}]}],
	{listen, Opts}.

