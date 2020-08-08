%%% ocs_diameter_3gpp_s6a_application_cb.erl 
%%% vim: ts=3
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%% @copyright 2016 - 2020 SigScale Global Inc.
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
%%% @doc This {@link //stdlib/gen_server. gen_server} behaviour callback
%%% 	module receives {@link //diameter. diameter} messages on a port assigned
%%% 	for the 3GPP DIAMETER S6a/S6d in the {@link //ocs. ocs} application.
%%%
%%% @reference 3GPP TS TS 29.272 MME and SGSN Diameter Interfaces
%%%
-module(ocs_diameter_3gpp_s6a_application_cb).
-copyright('Copyright (c) 2016 - 2020 SigScale Global Inc.').

-export([peer_up/3, peer_down/3, pick_peer/5, prepare_request/4,
		prepare_retransmit/4, handle_answer/5, handle_error/5,
		handle_request/3]).

-include_lib("diameter/include/diameter.hrl").
-include_lib("diameter/include/diameter_gen_base_rfc6733.hrl").
-include("diameter_gen_ietf.hrl").
-include("diameter_gen_3gpp_s6a_application.hrl").
-include("ocs.hrl").

-record(state, {}).

-define(EPOCH_OFFSET, 2208988800).
-define(S6a_APPLICATION_ID, 16777251).

-type state() :: #state{}.
-type capabilities() :: #diameter_caps{}.
-type packet() ::  #diameter_packet{}.
-type message() ::  tuple() | list().
-type peer() :: {Peer_Ref :: term(), Capabilities :: capabilities()}.

%%----------------------------------------------------------------------
%%  The DIAMETER application callbacks
%%----------------------------------------------------------------------

-spec peer_up(ServiceName, Peer, State) -> NewState
	when
		ServiceName :: diameter:service_name(),
		Peer ::  peer(),
		State :: state(),
		NewState :: state().
%% @doc Invoked when the peer connection is available
peer_up(_ServiceName, _Peer, State) ->
    State.

-spec peer_down(ServiceName, Peer, State) -> NewState
	when
		ServiceName :: diameter:service_name(),
		Peer :: peer(),
		State :: state(),
		NewState :: state().
%% @doc Invoked when the peer connection is not available
peer_down(_ServiceName, _Peer, State) ->
    State.

-spec pick_peer(LocalCandidates, RemoteCandidates,
		ServiceName, State, Fsm) -> Result
	when
		LocalCandidates :: [peer()],
		RemoteCandidates :: [peer()],
		ServiceName :: diameter:service_name(),
		State :: state(),
		Fsm :: pid(),
		NewState :: state(),
		Selection :: {ok, Peer} | {Peer, NewState},
		Peer :: peer() | false,
		Result :: Selection | false.
%% @doc Invoked as a consequence of a call to diameter:call/4 to select
%% a destination peer for an outgoing request. 
pick_peer([Peer | _] = _LocalCandidates, _RemoteCandidates,
		_ServiceName, _State, _Fsm) ->
	{ok, Peer}.

-spec prepare_request(Packet, ServiceName, Peer, Fsm) -> Action
	when
		Packet :: packet(),
		ServiceName :: diameter:service_name(),
		Peer :: peer(),
		Fsm :: pid(),
		Action :: Send | Discard | {eval_packet, Action, PostF},
		Send :: {send, packet() | message()},
		Discard :: {discard, Reason} | discard,
		Reason :: term(),
		PostF :: diameter:evaluable().
%% @doc Invoked to return a request for encoding and transport 
prepare_request(#diameter_packet{} = Packet, _ServiceName, _Peer, _Fsm) ->
	{send, Packet}.

-spec prepare_retransmit(Packet, ServiceName, Peer, Fsm) -> Action
	when
		Packet :: packet(),
		ServiceName :: diameter:service_name(),
		Peer :: peer(),
		Fsm :: pid(),
		Action :: Send | Discard | {eval_packet, Action, PostF},
		Send :: {send, packet() | message()},
		Discard :: {discard, Reason} | discard,
		Reason :: term(),
		PostF :: diameter:evaluable().
%% @doc Invoked to return a request for encoding and retransmission.
%% In case of peer connection is lost alternate peer is selected.
prepare_retransmit(Packet, ServiceName, Peer, Fsm) ->
	prepare_request(Packet, ServiceName, Peer, Fsm).

-spec handle_answer(Packet, Request, ServiceName, Peer, Fsm) -> Result
	when
		Packet :: packet(),
		Request :: message(),
		ServiceName :: diameter:service_name(),
		Peer :: peer(),
		Fsm :: pid(),
		Result :: term().
%% @doc Invoked when an answer message is received from a peer.
handle_answer(#diameter_packet{msg = Answer, errors = []} = _Packet,
		_Request, _ServiceName, _Peer, Fsm) ->
    gen_fsm:send_event(Fsm, {ok, Answer});
handle_answer(#diameter_packet{msg = Answer, errors = Errors} = _Packet,
		Request, ServiceName, {_, Caps} = _Peer, Fsm) ->
	errors(ServiceName, Caps, Request, Errors),
	gen_fsm:send_event(Fsm, {ok, Answer}).

-spec handle_error(Reason, Request, ServiceName, Peer, Fsm) -> Result
	when
		Reason :: timeout | failover | term(),
		Request :: message(),
		ServiceName :: diameter:service_name(),
		Peer :: peer(),
		Fsm :: pid(),
		Result :: term().
%% @doc Invoked when an error occurs before an answer message is received
%% in response to an outgoing request.
handle_error(Reason, _Request, _ServiceName, _Peer, Fsm) ->
    gen_fsm:send_event(Fsm, {error, Reason}).

-spec handle_request(Packet, ServiceName, Peer) -> Action
	when
		Packet :: packet(),
		ServiceName :: term(),
		Peer :: peer(),
		Action :: Reply | {relay, [Opt]} | discard
			| {eval | eval_packet, Action, PostF},
		Reply :: {reply, packet() | message()}
			| {answer_message, 3000..3999|5000..5999}
			| {protocol_error, 3000..3999},
		Opt :: diameter:call_opt(),
		PostF :: diameter:evaluable().
%% @doc Invoked when a request message is received from the peer.
handle_request(#diameter_packet{msg = Request, errors = []} = _Packet,
		ServiceName, {_, Caps} = _Peer) ->
	request(ServiceName, Caps, Request);
handle_request(#diameter_packet{msg = Request, errors = Errors} = _Packet,
		ServiceName, {_, Caps} = _Peer) ->
	case errors(ServiceName, Caps, Request, Errors) of
		ok ->
			request(ServiceName, Caps, Request);
		{error, Error} ->
			{answer_message, Error}
	end.

%%----------------------------------------------------------------------
%%  internal functions
%%----------------------------------------------------------------------

-spec request(ServiceName, Capabilities, Request) -> Action
	when
		ServiceName :: term(),
		Capabilities :: capabilities(),
		Request :: message(),
		Action :: Reply | {relay, [Opt]} | discard
			| {eval|eval_packet, Action, PostF},
		Reply :: {reply, packet() | message()}
			| {answer_message, 3000..3999|5000..5999}
			| {protocol_error, 3000..3999},
		Opt :: diameter:call_opt(),
		PostF :: diameter:evaluable().
%% @doc Handle received request.
%% @private
request(ServiceName, Capabilities, Request) ->
	#diameter_caps{host_ip_address = {_, HostIpAddresses}} = Capabilities,
	request(ServiceName, Capabilities, Request, HostIpAddresses).
%% @hidden
request(ServiceName, Capabilities, Request, [H | T]) ->
	case ocs:find_client(H) of
		{ok, #client{protocol = diameter, port = Port,
				password_required = PasswordReq, trusted = Trusted}} ->
			process_request(ServiceName, Capabilities, Request,
					H, Port, PasswordReq, Trusted);
		{error, not_found} ->
			request(ServiceName, Capabilities, Request, T)
	end;
request(ServiceName, Capabilities, Request, []) ->
	{error, Error} = errors(ServiceName, Capabilities, Request,
			[?'DIAMETER_BASE_RESULT-CODE_UNKNOWN_PEER']),
	{answer_message, Error}.

-spec process_request(ServiceName, Capabilities, Request,
		Address, Port, PasswordReq, Trusted) -> Result
	when
		ServiceName :: term(),
		Capabilities :: capabilities(),
		Request :: term(),
		Address :: inet:ip_address(),
		Port :: inet:port(),
		PasswordReq :: boolean(),
		Trusted :: boolean(),
		Result :: {reply, packet()} | discard.
%% @doc Process a received DIAMETER packet.
%% @private
%% @todo Handle S6a/S6d requests.
process_request(ServiceName, _Capabilities, Request,
		Address, Port, PasswordReq, Trusted) ->
erlang:display({?MODULE, ?LINE, Request}), discard;
process_request(ServiceName, #diameter_caps{origin_host = {OHost, _DHost},
		origin_realm = {ORealm, _DRealm}} = Capabilities,
		#'3gpp_s6a_AIR'{'Session-Id' = SId} = Request,
		Address, Port, PasswordReq, Trusted) ->
	try
		process_request1(ServiceName, Capabilities,
				Request, Address, Port, PasswordReq, Trusted)
	catch
		_:_Reason ->
			{reply, #'3gpp_s6a_AIA'{'Session-Id' = SId,
					'Result-Code' = ?'DIAMETER_BASE_RESULT-CODE_INVALID_AVP_BITS',
					'Origin-Host' = OHost, 'Origin-Realm' = ORealm}}
	end.
%% @hidden
process_request1(ServiceName, Capabilities,
		Request, Address, Port, PasswordReq, Trusted) ->
	[Info] = diameter:service_info(ServiceName, transport),
	case lists:keyfind(options, 1, Info) of
		{options, Options} ->
			case lists:keyfind(transport_config, 1, Options) of
				{transport_config, TC} ->
					{ip, Sip} = lists:keyfind(ip, 1, TC),
					{port, Sport} = lists:keyfind(port, 1, TC),
					case global:whereis_name({ocs_diameter_auth, Sip, Sport}) of
						undefined ->
							discard;
						PortServer ->
							Answer = gen_server:call(PortServer,
									{diameter_request, Capabilities,
											Address, Port, PasswordReq, Trusted,
											Request, none}),
							{reply, Answer}
					end;
				false ->
					discard
			end;
		false ->
			discard
	end.

-spec errors(ServiceName, Capabilities, Request, Errors) -> Result
	when
		ServiceName :: term(),
		Capabilities :: capabilities(),
		Request :: message(),
		Errors :: [Error],
		Error :: {Code, #diameter_avp{}} | Code,
		Code :: 0..4294967295,
		Result :: ok | {error, Error}.
%% @doc Handle errors in requests.
%% @private
errors(ServiceName, Capabilities, _Request,
		[{?'DIAMETER_BASE_RESULT-CODE_AVP_UNSUPPORTED', _} | _] = Errors) ->
	error_logger:error_report(["DIAMETER AVP unsupported",
			{service_name, ServiceName}, {capabilities, Capabilities},
			{errors, Errors}]),
	{error, ?'DIAMETER_BASE_RESULT-CODE_AVP_UNSUPPORTED'};
errors(ServiceName, Capabilities, _Request,
		[{?'DIAMETER_BASE_RESULT-CODE_INVALID_AVP_VALUE', _} | _] = Errors) ->
	error_logger:error_report(["DIAMETER AVP invalid",
			{service_name, ServiceName}, {capabilities, Capabilities},
			{errors, Errors}]),
	{error, ?'DIAMETER_BASE_RESULT-CODE_INVALID_AVP_VALUE'};
errors(ServiceName, Capabilities, _Request,
		[{?'DIAMETER_BASE_RESULT-CODE_MISSING_AVP', _} | _] = Errors) ->
	error_logger:error_report(["DIAMETER AVP missing",
			{service_name, ServiceName}, {capabilities, Capabilities},
			{errors, Errors}]),
	{error, ?'DIAMETER_BASE_RESULT-CODE_MISSING_AVP'};
errors(ServiceName, Capabilities, _Request,
		[{?'DIAMETER_BASE_RESULT-CODE_CONTRADICTING_AVPS', _} | _] = Errors) ->
	error_logger:error_report(["DIAMETER AVPs contradicting",
			{service_name, ServiceName}, {capabilities, Capabilities},
			{errors, Errors}]),
	{error, ?'DIAMETER_BASE_RESULT-CODE_CONTRADICTING_AVPS'};
errors(ServiceName, Capabilities, _Request,
		[{?'DIAMETER_BASE_RESULT-CODE_AVP_NOT_ALLOWED', _} | _] = Errors) ->
	error_logger:error_report(["DIAMETER AVP not allowed",
			{service_name, ServiceName}, {capabilities, Capabilities},
			{errors, Errors}]),
	{error, ?'DIAMETER_BASE_RESULT-CODE_AVP_NOT_ALLOWED'};
errors(ServiceName, Capabilities, _Request,
		[{?'DIAMETER_BASE_RESULT-CODE_AVP_OCCURS_TOO_MANY_TIMES', _} | _] = Errors) ->
	error_logger:error_report(["DIAMETER AVP too many times",
			{service_name, ServiceName}, {capabilities, Capabilities},
			{errors, Errors}]),
	{error, ?'DIAMETER_BASE_RESULT-CODE_AVP_OCCURS_TOO_MANY_TIMES'};
errors(ServiceName, Capabilities, _Request,
		[{?'DIAMETER_BASE_RESULT-CODE_INVALID_AVP_LENGTH', _} | _] = Errors) ->
	error_logger:error_report(["DIAMETER AVP invalid length",
			{service_name, ServiceName}, {capabilities, Capabilities},
			{errors, Errors}]),
	{error, ?'DIAMETER_BASE_RESULT-CODE_INVALID_AVP_LENGTH'};
errors(_ServiceName, _Capabilities, _Request, [{ResultCode, _} | _]) ->
	{error, ResultCode};
errors(_ServiceName, _Capabilities, _Request, [ResultCode | _]) ->
	{error, ResultCode};
errors(_ServiceName, _Capabilities, _Request, []) ->
	ok.

