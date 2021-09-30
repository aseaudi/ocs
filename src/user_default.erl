%%% user_default.erl
%%% vim: ts=3
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%% @copyright 2016 - 2021 SigScale Global Inc.
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
%%%

-module(user_default).
-copyright('Copyright (c) 2016 - 2021 SigScale Global Inc.').

%% export the user_default public API
-export([help/0, di/0, di/1, di/2, get_avp_info/1]).

-include_lib("diameter/include/diameter.hrl").

%%----------------------------------------------------------------------
%%  The user_default public API
%%----------------------------------------------------------------------

-spec help() -> true.
%% @doc Get help on shell local commands.
help() ->
	shell_default:help(),
	io:format("** ocs commands ** \n"),
	io:format("di()            -- diameter services info\n"),
	io:format("di(Types)       -- diameter services info of types\n"),
	io:format("di(acct, Types) -- diameter accounting services info\n"),
	io:format("di(auth, Types) -- diameter authentication and authorization services info\n"),
	true.

-spec di() -> Result
	when
		Result :: [ServiceResult],
		ServiceResult :: {Service, [term()]},
		Service :: term().
%% @doc Get information on running diameter services.
di() ->
	diameter_service_info(diameter:services(), []).

-spec di(Info) -> Result
	when
		Info :: [Item],
		Item :: peer | applications | capabilities
				| transport | connections | statistics,
		Result :: [ServiceResult],
		ServiceResult :: {Service, [term()]},
		Service :: term().
%% @doc Get information on running diameter services.
di(Info) ->
	diameter_service_info(diameter:services(), Info).

-spec di(ServiceType, Info) -> Result
	when
		ServiceType :: auth | acct,
		Info :: [Item],
		Item :: peer | applications | capabilities
				| transport | connections | statistics,
		Result :: term() | {error, Reason},
		Reason :: unknown_service.
%% @doc Get information on running diameter services.
di(auth, Info) ->
	F = fun({ocs_diameter_auth_service, _, _}) ->
				true;
			(_) ->
				false
	end,
	AuthServices = lists:filter(F, diameter:services()),
	diameter_service_info(AuthServices, Info);
di(acct, Info) ->
	F = fun({ocs_diameter_acct_service, _, _}) ->
				true;
			(_) ->
				false
	end,
	AcctServices = lists:filter(F, diameter:services()),
	diameter_service_info(AcctServices, Info).

-spec get_avp_info(AVP) -> Result
	when
		AVP :: AVPS :: atom() | origin_host | origin_realm |
				vendor_id | product_name |
				origin_state_id | host_ip_address |
				supported_vendor | auth_application_id |
				inband_security_id | acct_application_id |
				vendor_specific_application_id | firmware_revision,
		Result :: term().
%% @doc Get the status of a selected diameter avp.
get_avp_info(AVP) ->
	case diameter:services() of
		Services when length(Services) > 0 ->
			get_avp_info(avp(AVP), Services, []);
		[] ->
			[]
	end.
%% @hidden
get_avp_info(AVP, [H | T], Acc) ->
	get_avp_info(AVP, T, [diameter:service_info(H, AVP) | Acc]);
get_avp_info(_, [], Acc) ->
	lists:reverse(Acc).

%%----------------------------------------------------------------------
%%  The user_default private API
%%----------------------------------------------------------------------

-spec diameter_service_info(Services, Info) -> Result
	when
		Services :: [term()],
		Info :: [Item],
		Item :: peer | applications | capabilities
				| transport | connections | statistics,
		Result :: [ServiceResult],
		ServiceResult :: {Service, [term()]},
		Service :: term().
%% @hidden
diameter_service_info(Services, []) ->
	Info = [peer, applications, capabilities,
			transport, connections, statistics],
	diameter_service_info(Services, Info, []);
diameter_service_info(Services, Info) ->
	diameter_service_info(Services, Info, []).
%% @hidden
diameter_service_info([Service | T], Info, Acc) ->
	diameter_service_info(T, Info,
			[{Service, diameter:service_info(Service, Info)} | Acc]);
diameter_service_info([], _Info, Acc) ->
	lists:reverse(Acc).

-spec avp(Value) -> AVP
	when
		Value :: origin_host | origin_realm |
				vendor_id | product_name |
				origin_state_id | host_ip_address |
				supported_vendor | auth_application_id |
				inband_security_id | acct_application_id |
				vendor_specific_application_id | firmware_revision,
		AVP :: 'Origin-Host' | 'Origin-Realm' |
				'Vendor-Id' | 'Product-Name' |
				'Origin-State-Id'| 'Host-IP-Address' |
				'Supported-Vendor' | 'Auth-Application-Id' |
				'Inband-Security-Id' | 'Acct-Application-Id' |
				'Vendor-Specific-Application-Id' | 'Firmware-Revision'.
%% @doc Get correct Diameter AVP format
avp(origin_host) ->
	'Origin-Host';
avp(origin_realm) ->
	'Origin-Realm';
avp(vendor_id) ->
	'Vendor-Id';
avp(product_name) ->
	'Product-Name';
avp(origin_state_id) ->
	'Origin-State-Id';
avp(host_ip_address) ->
	'Host-IP-Address';
avp(supported_vendor) ->
	'Supported-Vendor';
avp(auth_application_id) ->
	'Auth-Application-Id';
avp(inband_security_id) ->
	'Inband-Security-Id';
avp(acc_application_id) ->
	'Acct-Application-Id';
avp(vendor_specific_application_id) ->
	'Vendor-Specific-Application-Id';
avp(firmware_revision) ->
	'Firmware-Revision'.

