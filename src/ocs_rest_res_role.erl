%%% ocs_rest_res_role.erl
%%% vim: ts=3
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%% @copyright 2021 SigScale Global Inc.
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
%%% @doc This library module implements resource handling functions
%%% 	for a REST server in the {@link //ocs. ocs} application.
%%%
%%% 	Handle `Role' collection.
%%%
-module(ocs_rest_res_role).
-copyright('Copyright (c) 2021 SigScale Global Inc.').

-export([content_types_accepted/0, content_types_provided/0, post_role/1,
		delete_role/1, get_roles/2, get_role/2]).

-include_lib("inets/include/mod_auth.hrl").
-include("ocs.hrl").

%% support deprecated_time_unit()
-define(MILLISECOND, milli_seconds).

-spec content_types_accepted() -> ContentTypes
	when
		ContentTypes :: list().
%% @doc Returns list of resource representations accepted.
content_types_accepted() ->
	["application/json", "application/json-patch+json"].

-spec content_types_provided() -> ContentTypes
	when
		ContentTypes :: list().
%% @doc Returns list of resource representations available.
content_types_provided() ->
	["application/json", "application/problem+json"].

-spec post_role(RequestBody) -> Result
	when
		RequestBody :: list(),
		Result :: {ok, Headers :: [tuple()], Body :: iolist()}
			| {error, ErrorCode :: integer()}.
%% @doc Handle `POST' request on `Role' collection.
%% 	Respond to `POST /partyRoleManagement/v4/partyRole' request.
post_role(RequestBody) ->
	try
		Role = role(mochijson:decode(RequestBody)),
		{Name, _, _, _} = Role#httpd_user.username,
		case ocs:add_user(Name, [], "en") of
			{ok, LastModified} ->
				Body = mochijson:encode(role(Role)),
				Location = "/partyRoleManagement/v4/partyRole/" ++ Name,
				Headers = [{content_type, "application/json"},
						{location, Location}, {etag, ocs_rest:etag(LastModified)}],
				{ok, Headers, Body};
			{error, _Reason} ->
				{error, 400}
		end
	catch
		_:500 ->
			{error, 500};
		_:_Reason1 ->
			{error, 400}
	end.

-spec delete_role(Name) -> Result
	when
		Name :: string(),
		Result :: {ok, Headers :: [tuple()], Body :: iolist()}
				| {error, ErrorCode :: integer()} .
%% @doc Handle `DELETE' request on a `Role' resource.
%% 	Respond to `DELETE /partyRoleManagement/v4/partyRole/{Name}' request.
delete_role(Name) ->
	delete_role(Name, get_params()).
delete_role(Name, {Port, Address, Directory, _Group}) ->
	case mod_auth:delete_user(Name, Address, Port, Directory) of
		true ->
			{ok, [], []};
		{error, _Reason} ->
			{error, 400}
	end;
delete_role(_Name, {error, Reason}) ->
	{error, Reason}.

-spec get_roles(Query, Headers) -> Result
	when
		Query :: [{Key :: string(), Value :: string()}],
		Headers :: [tuple()],
		Result :: {ok, Headers :: [tuple()], Body :: iolist()}
				| {error, ErrorCode :: integer()}.
%% @doc Handle `GET' request on `Role' collection.
%% 	Respond to `GET /partyRoleManagement/v4/partyRole/' request.
get_roles(Query, Headers) ->
	case lists:keytake("fields", 1, Query) of
		{value, {_, Filters}, NewQuery} ->
			get_roles1(NewQuery, Filters, Headers);
		false ->
			get_roles1(Query, [], Headers)
	end.
%% @hidden
get_roles1(Query, Filters, Headers) ->
	case {lists:keyfind("if-match", 1, Headers),
			lists:keyfind("if-range", 1, Headers),
			lists:keyfind("range", 1, Headers)} of
		{{"if-match", Etag}, false, {"range", Range}} ->
			case global:whereis_name(Etag) of
				undefined ->
					{error, 412};
				PageServer ->
					case ocs_rest:range(Range) of
						{error, _} ->
							{error, 400};
						{ok, {Start, End}} ->
							query_page(PageServer, Etag, Query, Filters, Start, End)
					end
			end;
		{{"if-match", Etag}, false, false} ->
			case global:whereis_name(Etag) of
				undefined ->
					{error, 412};
				PageServer ->
					query_page(PageServer, Etag, Query, Filters, undefined, undefined)
			end;
		{false, {"if-range", Etag}, {"range", Range}} ->
			case global:whereis_name(Etag) of
				undefined ->
					case ocs_rest:range(Range) of
						{error, _} ->
							{error, 400};
						{ok, {Start, End}} ->
							query_start(Query, Filters, Start, End)
					end;
				PageServer ->
					case ocs_rest:range(Range) of
						{error, _} ->
							{error, 400};
						{ok, {Start, End}} ->
							query_page(PageServer, Etag, Query, Filters, Start, End)
					end
			end;
		{{"if-match", _}, {"if-range", _}, _} ->
			{error, 400};
		{_, {"if-range", _}, false} ->
			{error, 400};
		{false, false, {"range", Range}} ->
			case ocs_rest:range(Range) of
				{error, _} ->
					{error, 400};
				{ok, {Start, End}} ->
					query_start(Query, Filters, Start, End)
			end;
		{false, false, false} ->
			query_start(Query, Filters, undefined, undefined)
	end.

-spec get_role(Name, Query) -> Result
	when
		Name :: string(),
		Query :: [{Key :: string(), Value :: string()}],
		Result :: {ok, Headers :: [tuple()], Body :: iolist()}
				| {error, ErrorCode :: integer()}.
%% @doc Handle `GET' request on a `Role' resource.
%% 	Respond to `GET /partyRoleManagement/v4/partyRole/{Name}' request.
get_role(Name, Query) ->
	get_role(Name, Query, get_params()).
%% @hidden
get_role(Name, Query, {_, _, _, _} = Params) ->
	case lists:keytake("fields", 1, Query) of
		{value, {_, L}, NewQuery} ->
			get_role(Name, NewQuery, Params, string:tokens(L, ","));
		false ->
			get_role(Name, Query, Params, [])
	end;
get_role(_Name, _Query, {error, Reason}) ->
	{error, Reason}.
%% @hidden
get_role(Name, [] = _Query, {Port, Address, Dir, _Group}, _Filters) ->
	case mod_auth:get_user(Name, Address, Port, Dir) of
		{ok, #httpd_user{user_data = UserData} = RoleRec} ->
			Headers = case lists:keyfind(last_modified, 1, UserData) of
				{_, LastModified} ->
					[{content_type, "application/json"},
							{etag, im_rest:etag(LastModified)}];
				false ->
					[{content_type, "application/json"}]
			end,
			Body = mochijson:encode(role(RoleRec)),
			{ok, Headers, Body};
		{error, _Reason} ->
			{error, 404}
	end;
get_role(_, _, _, _) ->
	{error, 400}.

%%----------------------------------------------------------------------
%%  internal functions
%%----------------------------------------------------------------------

-spec get_params() -> Result
	when
		Result :: {Port :: integer(), Address :: string(),
				Directory :: string(), Group :: string()}
				| {error, Reason :: term()}.
%% @doc Returns configurations details for currently running
%% {@link //inets. httpd} service.
%% @hidden
get_params() ->
	get_params(inets:services_info()).
%% @hidden
get_params({error, Reason}) ->
	{error, Reason};
get_params(ServicesInfo) ->
	get_params1(lists:keyfind(httpd, 1, ServicesInfo)).
%% @hidden
get_params1({httpd, _, HttpdInfo}) ->
	{_, Address} = lists:keyfind(bind_address, 1, HttpdInfo),
	{_, Port} = lists:keyfind(port, 1, HttpdInfo),
	get_params2(Address, Port, application:get_env(inets, services));
get_params1(false) ->
	{error, httpd_not_started}.
%% @hidden
get_params2(Address, Port, {ok, Services}) ->
	get_params3(Address, Port, lists:keyfind(httpd, 1, Services));
get_params2(_, _, undefined) ->
	{error, inet_services_undefined}.
%% @hidden
get_params3(Address, Port, {httpd, Httpd}) ->
	get_params4(Address, Port, lists:keyfind(directory, 1, Httpd));
get_params3(_, _, false) ->
	{error, httpd_service_undefined}.
%% @hidden
get_params4(Address, Port, {directory, {Directory, Auth}}) ->
	get_params5(Address, Port, Directory,
			lists:keyfind(require_group, 1, Auth));
get_params4(_, _, false) ->
	{error, httpd_directory_undefined}.
%% @hidden
get_params5(Address, Port, Directory, {require_group, [Group | _]}) ->
	{Port, Address, Directory, Group};
get_params5(_, _, _, false) ->
	{error, httpd_group_undefined}.

-spec role(Role) -> Role
	when
		Role :: #httpd_user{} | {struct, [tuple()]}.
%% @doc CODEC for HTTP server users.
role(#httpd_user{username = {Name, _, _, _}} = User) when is_list(Name) ->
	role(User#httpd_user{username = Name});
role(#httpd_user{username = Name, user_data = UserData})
		when is_list(UserData) ->
	F = fun(Key) ->
			case lists:keyfind(Key, 1, UserData) of
				{Key, Value} ->
					Value;
				false ->
					false
			end
	end,
	{struct, [{"id", Name}, {"name", Name}, {"@type", F(type)}, {"validFor",
					{struct, [{"startDateTime", ocs_rest:iso8601(F(start_date))},
					{"endDateTime", ocs_rest:iso8601(F(end_date))}]}},
			{"href", "/partyRoleManagement/v4/partyRole/" ++ Name}]};
role({struct, L}) when is_list(L) ->
	role(L, #httpd_user{user_data = []}).
%% @hidden
role([{"name", Name} | T], Acc) when is_list(Name) ->
	case get_params() of
		{Port, Address, Directory, _Group} ->
			role(T, Acc#httpd_user{username = {Name, Address, Port, Directory}});
		{error, _Reason} ->
			{error, 500}
	end;
role([{"@type", Type} | T], #httpd_user{user_data = UserData} = Acc)
		when is_list(Type) ->
	role(T, Acc#httpd_user{user_data = [{type, Type} | UserData]});
role([{"validFor", {struct, ValidFor}} | T], Acc) when is_list(ValidFor) ->
	role(T, valid_for(ValidFor, Acc));
role([], Acc) ->
	Acc.

%% @hidden
valid_for([{"startDateTime", StartDate} | T],
		#httpd_user{user_data = UserData} = Acc) when is_list(StartDate) ->
	valid_for(T, Acc#httpd_user{user_data = [{start_date,
			ocs_rest:iso8601(StartDate)} | UserData]});
valid_for([{"endDateTime", EndDate} | T],
		#httpd_user{user_data = UserData} = Acc) when is_list(EndDate) ->
	valid_for(T, Acc#httpd_user{user_data = [{end_date,
			ocs_rest:iso8601(EndDate)} | UserData]});
valid_for([], Acc) ->
	Acc.

%% @hidden
query_start(Query, Filters, RangeStart, RangeEnd) ->
	try
		{Port, Address, Directory, _Group} = get_params(),
		case lists:keyfind("filter", 1, Query) of
			{_, String} ->
				{ok, Tokens, _} = ocs_rest_query_scanner:string(String),
				case ocs_rest_query_parser:parse(Tokens) of
					{ok, [{array, [{complex, [{"id", like, [Id]}]}]}]} ->
						Username = {Id ++ '_', Address, Port, Directory},
						{#httpd_user{username = Username, _ = '_'}, []};
					{ok, [{array, [{complex, [{"id", exact, [Id]}]}]}]} ->
						Username = {Id ++ '_', Address, Port, Directory},
						{#httpd_user{username = Username, _ = '_'}, []}
				end;
			false ->
				{'_', '_'}
		end
	of
		{MatchHead, MatchConditions} ->
			MFA = [ocs, query_users, [MatchHead, MatchConditions]],
			case supervisor:start_child(ocs_rest_pagination_sup, [MFA]) of
				{ok, PageServer, Etag} ->
					query_page(PageServer, Etag, Query, Filters, RangeStart, RangeEnd);
				{error, _Reason} ->
					{error, 500}
			end
	catch
		_:_ ->
			{error, 400}
	end.

%% @hidden
query_page(PageServer, Etag, _Query, _Filters, Start, End) ->
	case gen_server:call(PageServer, {Start, End}, infinity) of
		{error, Status} ->
			{error, Status};
		{Events, ContentRange} ->
			F = fun(#httpd_user{user_data = UserData} = User) ->
					case lists:keyfind(type, 1, UserData) of
						{type, "PartyRole"} ->
							{true, role(User)};
						false ->
							false
					end
			end,
			Body = mochijson:encode({array, lists:filtermap(F, Events)}),
			Headers = [{content_type, "application/json"},
					{etag, Etag}, {accept_ranges, "items"},
					{content_range, ContentRange}],
			{ok, Headers, Body}
	end.

