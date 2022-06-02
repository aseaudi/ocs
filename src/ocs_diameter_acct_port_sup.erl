%%% ocs_diameter_acct_port_sup.erl
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
%%% @docfile "{@docsrc supervision.edoc}"
%%%
-module(ocs_diameter_acct_port_sup).
-copyright('Copyright (c) 2016 - 2021 SigScale Global Inc.').

-behaviour(supervisor).

%% export the callback needed for supervisor behaviour
-export([init/1]).

-ifdef(OTP_RELEASE).
	-if(?OTP_RELEASE >= 23).
		-define(PG_CREATE(Name), ok).
	-else.
		-define(PG_CREATE(Name), pg2:create(Name)).
	-endif.
-else.
	-define(PG_CREATE(Name), pg2:create(Name)).
-endif.

%%----------------------------------------------------------------------
%%  The supervisor callback
%%----------------------------------------------------------------------

-spec init(Args) -> Result
	when
		Args :: [term()],
		Result :: {ok, {{supervisor:strategy(), non_neg_integer(), pos_integer()},
			[supervisor:child_spec()]}} | ignore.
%% @doc Initialize the {@module} supervisor.
%% @see //stdlib/supervisor:init/1
%% @private
%%
init([Address, Port, Options]) ->
	?PG_CREATE(?MODULE),
	ChildSpecs = [supervisor(ocs_diameter_disconnect_fsm_sup, []),
		supervisor(ocs_diameter_acct_service_fsm_sup, [Address, Port, Options])],
	{ok, {{one_for_one, 10, 60}, ChildSpecs}}.

%%----------------------------------------------------------------------
%%  internal functions
%%----------------------------------------------------------------------

%% @hidden
supervisor(StartMod, StartArgs) ->
	StartFunc = {supervisor, start_link, [StartMod, StartArgs]},
	{StartMod, StartFunc, permanent, infinity, supervisor, [StartMod]}.

