%%% ocs_rest_api_SUITE.erl
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
%%%  @doc Test suite for REST API
%%% 	of the {@link //ocs. ocs} application.
%%%
-module(ocs_rest_api_SUITE).
-copyright('Copyright (c) 2016 - 2017 SigScale Global Inc.').

%% common_test required callbacks
-export([suite/0, sequences/0, all/0]).
-export([init_per_suite/1, end_per_suite/1]).
-export([init_per_testcase/2, end_per_testcase/2]).

%% Note: This directive should only be used in test suites.
-compile(export_all).

-include_lib("radius/include/radius.hrl").
-include_lib("inets/include/mod_auth.hrl").
-include("ocs.hrl").
-include("ocs_eap_codec.hrl").
-include_lib("common_test/include/ct.hrl").

%% support deprecated_time_unit()
-define(SECOND, seconds).
%-define(SECOND, second).

%% support deprecated_time_unit()
-define(MILLISECOND, milli_seconds).
%-define(MILLISECOND, millisecond).

-define(PathBalanceHub, "/balanceManagement/v1/hub/").
-define(PathProductHub, "/productInventoryManagement/v2/hub/").
-define(PathServiceHub, "/serviceInventoryManagement/v2/hub/").

%%---------------------------------------------------------------------
%%  Test server callback functions
%%---------------------------------------------------------------------

-spec suite() -> DefaultData :: [tuple()].
%% Require variables and set default values for the suite.
%%
suite() ->
	[{userdata, [{doc, "Test suite for REST API in OCS"}]},
	{timetrap, {minutes, 1}},
	{require, rest_user}, {default_config, rest_user, "bss"},
	{require, rest_pass}, {default_config, rest_pass, "nfc9xgp32xha"},
	{require, rest_group}, {default_config, rest_group, "all"}].

-spec init_per_suite(Config :: [tuple()]) -> Config :: [tuple()].
%% Initialization before the whole suite.
%%
init_per_suite(Config) ->
	ok = ocs_test_lib:initialize_db(),
	ok = ocs_test_lib:start(),
	{ok, Services} = application:get_env(inets, services),
	Fport = fun FPort([{httpd, L} | T]) ->
				case lists:keyfind(server_name, 1, L) of
					{_, "rest"} ->
						H1 = lists:keyfind(bind_address, 1, L),
						P1 = lists:keyfind(port, 1, L),
						{H1, P1};
					_ ->
						FPort(T)
				end;
			FPort([_ | T]) ->
				FPort(T)
	end,
	RestUser = ct:get_config(rest_user),
	RestPass = ct:get_config(rest_pass),
	_RestGroup = ct:get_config(rest_group),
	{Host, Port} = case Fport(Services) of
		{{_, H2}, {_, P2}} when H2 == "localhost"; H2 == {127,0,0,1} ->
			{ok, _} = ocs:add_user(RestUser, RestPass, "en"),
			{"localhost", P2};
		{{_, H2}, {_, P2}} ->
			{ok, _} = ocs:add_user(RestUser, RestPass, "en"),
			case H2 of
				H2 when is_tuple(H2) ->
					{inet:ntoa(H2), P2};
				H2 when is_list(H2) ->
					{H2, P2}
			end;
		{false, {_, P2}} ->
			{ok, _} = ocs:add_user(RestUser, RestPass, "en"),
			{"localhost", P2}
	end,
	{ok, ProductID} = ocs_test_lib:add_offer(),
	Config1 = [{port, Port}, {product_id, ProductID} | Config],
	HostUrl = "https://" ++ Host ++ ":" ++ integer_to_list(Port),
	[{host_url, HostUrl} | Config1].

-spec end_per_suite(Config :: [tuple()]) -> any().
%% Cleanup after the whole suite.
%%
end_per_suite(Config) ->
	ok = ocs_test_lib:stop(),
	Config.

-spec init_per_testcase(TestCase :: atom(), Config :: [tuple()]) -> Config :: [tuple()].
%% Initialization before each test case.
%%
init_per_testcase(TestCase, Config) when TestCase == notify_create_bucket;
		TestCase == notify_delete_expired_bucket;
		TestCase == notify_create_product; TestCase == notify_create_service ->
	true = register(TestCase, self()),
	case inets:start(httpd, [{port, 0},
			{server_name, atom_to_list(?MODULE)},
			{server_root, "./"},
			{document_root, ?config(data_dir, Config)},
			{modules, [mod_esi]},
			{erl_script_alias, {"/listener", [?MODULE]}}]) of
		{ok, Pid} ->
			[{port, Port}] = httpd:info(Pid, [port]),
			[{listener_port, Port},
					{listener_pid, Pid} | Config];
		{error, Reason} ->
			{error, Reason}
	end;
init_per_testcase(_TestCase, Config) ->
	Config.

-spec end_per_testcase(TestCase :: atom(), Config :: [tuple()]) -> any().
%% Cleanup after each test case.
%%
end_per_testcase(_TestCase, _Config) ->
	ok.

-spec sequences() -> Sequences :: [{SeqName :: atom(), Testcases :: [atom()]}].
%% Group test cases into a test sequence.
%%
sequences() ->
	[].

-spec all() -> TestCases :: [Case :: atom()].
%% Returns a list of all test cases in this test suite.
%%
all() ->
	[authenticate_user_request, unauthenticate_user_request,
	add_user, get_user, delete_user,
	update_user_characteristics_json_patch,
	add_client, add_client_without_password, get_client, get_client_id,
	get_client_bogus, get_client_notfound, get_all_clients,
	get_client_range, get_clients_filter, delete_client,
	update_client_password_json_patch,
	update_client_attributes_json_patch,
	add_offer, get_offer, delete_offer, ignore_delete_offer, update_offer,
	add_service_inventory, add_service_inventory_without_password,
	get_service_inventory, get_all_service_inventories, add_service_aka,
	get_service_not_found, get_service_range, delete_service,
	update_service, get_usagespecs, get_usagespecs_query, get_usagespec,
	get_auth_usage, get_auth_usage_id, get_auth_usage_filter,
	get_auth_usage_range, get_acct_usage, get_acct_usage_id,
	get_acct_usage_filter, get_acct_usage_range, get_ipdr_usage,
	top_up, get_balance, simultaneous_updates_on_client_failure,
	get_product, add_product, add_product_sms,
	update_product_realizing_service, delete_product,
	ignore_delete_product, query_product, filter_product,
	post_hub_balance, delete_hub_balance, notify_create_bucket,
	notify_delete_expired_bucket,
	post_hub_product, delete_hub_product, notify_create_product,
	post_hub_service, delete_hub_service, notify_create_service].

%%%%%---------------------------------------------------------------------
%%  Test cases
%%---------------------------------------------------------------------
authenticate_user_request() ->
	[{userdata, [{doc, "Authorized user request to the server"}]}].

authenticate_user_request(Config) ->
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Request = {HostUrl ++ "/usageManagement/v1/usage", [Accept, auth_header()]},
	{ok, _Result} = httpc:request(get, Request, [], []).

unauthenticate_user_request() ->
	[{userdata, [{doc, "Authorized user request to the server"}]}].

unauthenticate_user_request(Config) ->
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	RestUser = ocs:generate_identity(),
	RestPass = ocs:generate_password(),
	Encodekey = base64:encode_to_string(string:concat(RestUser ++ ":", RestPass)),
	AuthKey = "Basic " ++ Encodekey,
	Authentication = {"authorization", AuthKey},
	Request = {HostUrl ++ "/usageManagement/v1/usage", [Accept, Authentication]},
	{ok, Result} = httpc:request(get, Request, [], []),
	{{"HTTP/1.1", 401, _}, _, _} = Result.

add_user() ->
	[{userdata, [{doc,"Add user in rest interface"}]}].

add_user(Config) ->
	ContentType = "application/json",
	ID = "King",
	Username = ID,
	Password = "KingKong",
	Locale = "en",
	PasswordAttr = {struct, [{"name", "password"}, {"value", Password}]},
	LocaleAttr = {struct, [{"name", "locale"}, {"value", Locale}]},
	UsernameAttr = {struct, [{"name", "username"}, {"value", Username}]},
	CharArray = {array, [UsernameAttr, PasswordAttr, LocaleAttr]},
	JSON = {struct, [{"id", ID}, {"characteristic", CharArray}]},
	RequestBody = lists:flatten(mochijson:encode(JSON)),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Request1 = {HostUrl ++ "/partyManagement/v1/individual", [Accept, auth_header()], ContentType, RequestBody},
	{ok, Result} = httpc:request(post, Request1, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, ResponseBody} = Result,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers),
	ContentLength = integer_to_list(length(ResponseBody)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{_, URI} = lists:keyfind("location", 1, Headers),
	{"/partyManagement/v1/individual/" ++ ID, _} = httpd_util:split_path(URI),
	{struct, Object} = mochijson:decode(ResponseBody),
	{_, ID} = lists:keyfind("id", 1, Object),
	{_, URI} = lists:keyfind("href", 1, Object),
	{_, {array, _Characteristic}} = lists:keyfind("characteristic", 1, Object),
	{ok, #httpd_user{username = Username, password = Password,
			user_data = UserData}} = ocs:get_user(ID),
	{_, Locale} = lists:keyfind(locale, 1, UserData).

get_user() ->
	[{userdata, [{doc,"get user in rest interface"}]}].

get_user(Config) ->
	ID = "Prince",
	Password = "Frog",
	Locale = "es",
	{ok, _} = ocs:add_user(ID, Password, Locale),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Request2 = {HostUrl ++ "/partyManagement/v1/individual/" ++ ID, [Accept, auth_header()]},
	{ok, Result1} = httpc:request(get, Request2, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers1, Body1} = Result1,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers1),
	{struct, Object} = mochijson:decode(Body1),
	{_, ID} = lists:keyfind("id", 1, Object),
	{_, _URI2} = lists:keyfind("href", 1, Object),
	{_, {array, Characteristic}} = lists:keyfind("characteristic", 1, Object),
	F = fun(_F, [{struct, [{"name", Name}, {"value", Value}]} | _T], Name) ->
				{ok, Value};
			(_F, [{struct, [{"value", Value}, {"name", Name}]} | _T], Name) ->
				{ok, Value};
			(F, [_ | T], Name) ->
				F(F, T, Name);
			(_F, [], _Name) ->
				{error, not_found}
	end,
	{ok, ID} = F(F, Characteristic, "username"),
	{error, not_found} = F(F, Characteristic, "password"),
	{ok, Locale} = F(F, Characteristic, "locale").

delete_user() ->
	[{userdata, [{doc,"Delete user in rest interface"}]}].

delete_user(Config) ->
	ID = "Queen",
	Password = "QueenBee",
	Locale = "en",
	{ok, _} = ocs:add_user(ID, Password, Locale),
	HostUrl = ?config(host_url, Config),
	Request1 = {HostUrl ++ "/partyManagement/v1/individual/" ++ ID, [auth_header()]},
	{ok, Result1} = httpc:request(delete, Request1, [], []),
	{{"HTTP/1.1", 204, _NoContent}, _Headers1, []} = Result1,
	{error, no_such_user} = ocs:get_user(ID).

update_user_characteristics_json_patch() ->
	[{userdata, [{doc,"Use HTTP PATCH to update users's characteristics using
			json-patch media type"}]}].

update_user_characteristics_json_patch(Config) ->
	Username = "ryanstiles",
	Password = "wliaycaducb46",
	Locale = "en",
	{ok, _} = ocs:add_user(Username, Password, Locale),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Request2 = {HostUrl ++ "/partyManagement/v1/individual/" ++ Username,
			[Accept, auth_header()]},
	{ok, Result1} = httpc:request(get, Request2, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers1, Body1} = Result1,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers1),
	{_, Etag} = lists:keyfind("etag", 1, Headers1),
	{struct, Object} = mochijson:decode(Body1),
	{_, URI} = lists:keyfind("href", 1, Object),
	{_, {array, Characteristic}} = lists:keyfind("characteristic", 1, Object),
	ContentType = "application/json-patch+json",
	NewPassword = ocs:generate_password(),
	NewPwdObj = {struct, [{"name", "password"}, {"value", NewPassword}]},
	NewLocale = "es",
	NewLocaleObj = {struct, [{"name", "locale"}, {"value", NewLocale}]},
	F1 = fun(_F, [{struct, [{"name", Name}, _]} | _T], Name, N) ->
				integer_to_list(N);
			(_F, [{struct, [_, {"name", Name}]} | _T], Name, N) ->
				integer_to_list(N);
			(F, [_ | T], Name, N) ->
				F(F, T, Name, N + 1);
			(_F, [], _Name, _N) ->
				"-"
	end,
	IndexPassword= F1(F1, Characteristic, "password", 0),
	IndexLocale = F1(F1, Characteristic, "locale", 0),
	JSON = {array, [
			{struct, [{op, "add"}, {path, "/characteristic/" ++ IndexPassword}, {value, NewPwdObj}]},
			{struct, [{op, "replace"}, {path, "/characteristic/" ++ IndexLocale}, {value, NewLocaleObj}]}]},
	PatchBody = lists:flatten(mochijson:encode(JSON)),
	PatchBodyLen = size(list_to_binary(PatchBody)),
	RestPort = ?config(port, Config),
	PatchReq = ["PATCH ", URI, " HTTP/1.1",$\r,$\n,
			"Content-Type:" ++ ContentType, $\r,$\n, "Accept:application/json",$\r,$\n,
			"Authorization:"++ basic_auth(),$\r,$\n,
			"Host:localhost:" ++ integer_to_list(RestPort),$\r,$\n,
			"If-Match:" ++ Etag,$\r,$\n,
			"Content-Length:" ++ integer_to_list(PatchBodyLen),$\r,$\n,
			$\r, $\n,
			PatchBody],
	{ok, SslSock} = ssl:connect({127,0,0,1}, RestPort,  [binary, {active, false}], infinity),
	ok = ssl:send(SslSock, list_to_binary(PatchReq)),
	Timeout = 1500,
	F2 = fun(_F, _Sock, {error, timeout}, Acc) ->
					lists:reverse(Acc);
			(F, Sock, {ok, Bin}, Acc) ->
					F(F, Sock, ssl:recv(Sock, 0, Timeout), [Bin | Acc])
	end,
	RecvBuf = F2(F2, SslSock, ssl:recv(SslSock, 0, Timeout), []),
	PatchResponse = list_to_binary(RecvBuf),
	[Headers2, <<>>] = binary:split(PatchResponse, <<$\r,$\n,$\r,$\n>>),
	<<"HTTP/1.1 204", _/binary>> = Headers2,
	ok = ssl:close(SslSock),
	{ok, #httpd_user{username = Username, password = NewPassword,
			user_data = UserData}} = ocs:get_user(Username),
	{_, NewLocale} = lists:keyfind(locale, 1, UserData).

add_client() ->
	[{userdata, [{doc,"Add client in rest interface"}]}].

add_client(Config) ->
	ContentType = "application/json",
	ID = "10.2.53.9",
	Port = 3799,
	Protocol = "RADIUS",
	Secret = "ksc8c244npqc",
	JSON = {struct, [{"id", ID}, {"port", Port}, {"protocol", Protocol},
		{"secret", Secret}]},
	RequestBody = lists:flatten(mochijson:encode(JSON)),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Request1 = {HostUrl ++ "/ocs/v1/client/", [Accept, auth_header()], ContentType, RequestBody},
	{ok, Result} = httpc:request(post, Request1, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, ResponseBody} = Result,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers),
	ContentLength = integer_to_list(length(ResponseBody)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{_, URI} = lists:keyfind("location", 1, Headers),
	{"/ocs/v1/client/" ++ ID, _} = httpd_util:split_path(URI),
	{struct, Object} = mochijson:decode(ResponseBody),
	{_, ID} = lists:keyfind("id", 1, Object),
	{_, URI} = lists:keyfind("href", 1, Object),
	{_, Port} = lists:keyfind("port", 1, Object),
	{_, Protocol} = lists:keyfind("protocol", 1, Object),
	{_, Secret} = lists:keyfind("secret", 1, Object).

add_client_without_password() ->
	[{userdata, [{doc,"Add client without password"}]}].

add_client_without_password(Config) ->
	ContentType = "application/json",
	JSON = {struct, [{"id", "10.5.55.10"}]},
	RequestBody = lists:flatten(mochijson:encode(JSON)),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Request1 = {HostUrl ++ "/ocs/v1/client/", [Accept, auth_header()], ContentType, RequestBody},
	{ok, Result} = httpc:request(post, Request1, [], []),
	{{"HTTP/1.1", 201, _Created}, _Headers, ResponseBody} = Result,
	{struct, Object} = mochijson:decode(ResponseBody),
	{_, 3799} = lists:keyfind("port", 1, Object),
	{_, "RADIUS"} = lists:keyfind("protocol", 1, Object),
	{_, Secret} = lists:keyfind("secret", 1, Object),
	12 = length(Secret).

get_client() ->
	[{userdata, [{doc,"get client in rest interface"}]}].

get_client(Config) ->
	ContentType = "application/json",
	ID = "10.2.53.9",
	Port = 1899,
	Protocol = "RADIUS",
	Secret = "ksc8c244npqc",
	JSON = {struct, [{"id", ID}, {"port", Port}, {"protocol", Protocol},
		{"secret", Secret}]},
	RequestBody = lists:flatten(mochijson:encode(JSON)),
	HostUrl = ?config(host_url, Config),
	AcceptValue = "application/json",
	Accept = {"accept", AcceptValue},
	Request1 = {HostUrl ++ "/ocs/v1/client/", [Accept, auth_header()], ContentType, RequestBody},
	{ok, Result} = httpc:request(post, Request1, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, _} = Result,
	{_, URI1} = lists:keyfind("location", 1, Headers),
	{URI2, _} = httpd_util:split_path(URI1),
	Request2 = {HostUrl ++ URI2, [Accept, auth_header()]},
	{ok, Result1} = httpc:request(get, Request2, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers1, Body1} = Result1,
	{_, AcceptValue} = lists:keyfind("content-type", 1, Headers1),
	ContentLength = integer_to_list(length(Body1)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers1),
	{struct, Object} = mochijson:decode(Body1),
	{_, ID} = lists:keyfind("id", 1, Object),
	{_, URI2} = lists:keyfind("href", 1, Object),
	{_, Port} = lists:keyfind("port", 1, Object),
	{_, Protocol} = lists:keyfind("protocol", 1, Object),
	{_, Secret} = lists:keyfind("secret", 1, Object).

get_client_id() ->
	[{userdata, [{doc,"get client with identifier"}]}].

get_client_id(Config) ->
	ID = "10.2.53.19",
	Identifier = "nas-01-23-45",
	Secret = "ps5mhybc297m",
	{ok, _} = ocs:add_client(ID, Secret),
	{ok, Address} = inet:parse_address(ID),
	Fun = fun() ->
				[C1] = mnesia:read(client, Address, write),
				C2 = C1#client{identifier = list_to_binary(Identifier)},
				mnesia:write(C2)
	end,
	{atomic, ok} = mnesia:transaction(Fun),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Request = {HostUrl ++ "/ocs/v1/client/" ++ ID, [Accept, auth_header()]},
	{ok, Result} = httpc:request(get, Request, [], []),
	{{"HTTP/1.1", 200, _OK}, _, Body} = Result,
	{struct, Object} = mochijson:decode(Body),
	{_, ID} = lists:keyfind("id", 1, Object),
	{_, Identifier} = lists:keyfind("identifier", 1, Object).

get_client_bogus() ->
	[{userdata, [{doc, "get client bogus in rest interface"}]}].

get_client_bogus(Config) ->
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	ID = "beefbeefcafe",
	Request = {HostUrl ++ "/ocs/v1/client/" ++ ID, [Accept, auth_header()]},
	{ok, Result} = httpc:request(get, Request, [], []),
	{{"HTTP/1.1", 400, _BadRequest}, _Headers, _Body} = Result.

get_client_notfound() ->
	[{userdata, [{doc, "get client notfound in rest interface"}]}].

get_client_notfound(Config) ->
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	ID = "10.2.53.20",
	Request = {HostUrl ++ "/ocs/v1/client/" ++ ID, [Accept, auth_header()]},
	{ok, Result} = httpc:request(get, Request, [], []),
	{{"HTTP/1.1", 404, _}, _Headers, _Body} = Result.

get_all_clients() ->
	[{userdata, [{doc,"get all clients in rest interface"}]}].

get_all_clients(Config) ->
	ContentType = "application/json",
	ID = "10.2.53.8",
	Port = 1899,
	Protocol = "RADIUS",
	Secret = "ksc8c344npqc",
	JSON = {struct, [{"id", ID}, {"port", Port}, {"protocol", Protocol},
		{"secret", Secret}]},
	RequestBody = lists:flatten(mochijson:encode(JSON)),
	HostUrl = ?config(host_url, Config),
	AcceptValue = "application/json",
	Accept = {"accept", AcceptValue},
	Request1 = {HostUrl ++ "/ocs/v1/client", [Accept, auth_header()], ContentType, RequestBody},
	{ok, Result} = httpc:request(post, Request1, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, _} = Result,
	{_, URI1} = lists:keyfind("location", 1, Headers),
	Request2 = {HostUrl ++ "/ocs/v1/client", [Accept, auth_header()]},
	{ok, Result1} = httpc:request(get, Request2, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers1, Body1} = Result1,
	{_, AcceptValue} = lists:keyfind("content-type", 1, Headers1),
	ContentLength = integer_to_list(length(Body1)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers1),
	{array, ClientsList} = mochijson:decode(Body1),
	Pred1 = fun({struct, Param}) ->
		case lists:keyfind("id", 1, Param) of
			{_, ID} ->
				true;
			{_, _ID} ->
				false
		end
	end,
	[{struct, ClientVar}] = lists:filter(Pred1, ClientsList),
	{_, URI1} = lists:keyfind("href", 1, ClientVar),
	{_, Port} = lists:keyfind("port", 1, ClientVar),
	{_, Protocol} = lists:keyfind("protocol", 1, ClientVar),
	{_, Secret} = lists:keyfind("secret", 1, ClientVar).

get_client_range() ->
	[{userdata, [{doc,"Get range of items in the client collection"}]}].

get_client_range(Config) ->
	{ok, PageSize} = application:get_env(ocs, rest_page_size),
	Fadd = fun(_F, 0) ->
				ok;
			(F, N) ->
				Address = {10, rand:uniform(255),
						rand:uniform(255), rand:uniform(254)},
				Secret = ocs:generate_password(),
				{ok, _} = ocs:add_client(Address, Secret),
				F(F, N - 1)
	end,
	NumAdded = (PageSize * 2) + (PageSize div 2) + 17,
	ok = Fadd(Fadd, NumAdded),
	RangeSize = case PageSize > 25 of
		true ->
			rand:uniform(PageSize - 10) + 10;
		false ->
			PageSize - 1
	end,
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	RequestHeaders1 = [Accept, auth_header()],
	Request1 = {HostUrl ++ "/ocs/v1/client", RequestHeaders1},
	{ok, Result1} = httpc:request(get, Request1, [], []),
	{{"HTTP/1.1", 200, _OK}, ResponseHeaders1, Body1} = Result1,
	{_, Etag} = lists:keyfind("etag", 1, ResponseHeaders1),
	true = is_etag_valid(Etag),
	{_, AcceptRanges1} = lists:keyfind("accept-ranges", 1, ResponseHeaders1),
	true = lists:member("items", string:tokens(AcceptRanges1, ", ")),
	{_, Range1} = lists:keyfind("content-range", 1, ResponseHeaders1),
	["items", "1", RangeEndS1, "*"] = string:tokens(Range1, " -/"),
	RequestHeaders2 = RequestHeaders1 ++ [{"if-match", Etag}],
	PageSize = list_to_integer(RangeEndS1),
	{array, Clients1} = mochijson:decode(Body1),
	PageSize = length(Clients1),
	Fget = fun(F, RangeStart2, RangeEnd2) ->
				RangeHeader = [{"range",
						"items " ++ integer_to_list(RangeStart2)
						++ "-" ++ integer_to_list(RangeEnd2)}],
				RequestHeaders3 = RequestHeaders2 ++ RangeHeader,
				Request2 = {HostUrl ++ "/ocs/v1/client", RequestHeaders3},
				{ok, Result2} = httpc:request(get, Request2, [], []),
				{{"HTTP/1.1", 200, _OK}, ResponseHeaders2, Body2} = Result2,
				{_, Etag} = lists:keyfind("etag", 1, ResponseHeaders2),
				{_, AcceptRanges2} = lists:keyfind("accept-ranges", 1, ResponseHeaders2),
				true = lists:member("items", string:tokens(AcceptRanges2, ", ")),
				{_, Range} = lists:keyfind("content-range", 1, ResponseHeaders2),
				["items", RangeStartS, RangeEndS, EndS] = string:tokens(Range, " -/"),
				RangeStart2 = list_to_integer(RangeStartS),
				case EndS of
					"*" ->
						RangeEnd2 = list_to_integer(RangeEndS),
						RangeSize = (RangeEnd2 - (RangeStart2 - 1)),
						{array, Clients2} = mochijson:decode(Body2),
						RangeSize = length(Clients2),
						NewRangeStart = RangeEnd2 + 1,
						NewRangeEnd = NewRangeStart + (RangeSize - 1),
						F(F, NewRangeStart, NewRangeEnd);
					EndS when RangeEndS == EndS ->
						list_to_integer(EndS)
				end
	end,
	CollectionSize = length(ocs:get_clients()),
	CollectionSize = Fget(Fget, PageSize + 1, PageSize + RangeSize).

get_clients_filter() ->
	[{userdata, [{doc,"Get clients with filters"}]}].

get_clients_filter(Config) ->
	{ok, _} = ocs:add_client("10.0.123.100", 3799, radius, "ziggyzaggy", true),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Filters = "?filter=" ++ "\"[{id.like=[1%25]}]\"",
	Url = HostUrl ++ "/ocs/v1/client" ++ Filters,
	Request = {Url, [Accept, auth_header()]},
	{ok, Result} = httpc:request(get, Request, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers, Body} = Result,
	ContentLength = integer_to_list(length(Body)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{array, ClientsList} = mochijson:decode(Body),
	Fall = fun({struct, L}) ->
				lists:keymember("id", 1, L)
						and lists:keymember("href", 1, L)
						and lists:keymember("port", 1, L)
						and lists:keymember("protocol", 1, L)
						and lists:keymember("identifier", 1, L)
						and lists:keymember("secret", 1, L)
	end,
	true = lists:all(Fall, ClientsList).

delete_client() ->
	[{userdata, [{doc,"Delete client in rest interface"}]}].

delete_client(Config) ->
	ContentType = "application/json",
	ID = "10.2.53.9",
	Port = 1899,
	Protocol = "RADIUS",
	Secret = "ksc8c244npqc",
	JSON1 = {struct, [{"id", ID}, {"port", Port}, {"protocol", Protocol},
		{"secret", Secret}]},
	RequestBody = lists:flatten(mochijson:encode(JSON1)),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Request1 = {HostUrl ++ "/ocs/v1/client", [Accept, auth_header()], ContentType, RequestBody},
	{ok, Result} = httpc:request(post, Request1, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, _} = Result,
	{_, URI1} = lists:keyfind("location", 1, Headers),
	{URI2, _} = httpd_util:split_path(URI1),
	Request2 = {HostUrl ++ URI2, [auth_header()]},
	{ok, Result1} = httpc:request(delete, Request2, [], []),
	{{"HTTP/1.1", 204, _NoContent}, Headers1, []} = Result1,
	{_, "0"} = lists:keyfind("content-length", 1, Headers1).

add_offer() ->
	[{userdata, [{doc,"Create a new product offering."}]}].

add_offer(Config) ->
	CatalogHref = "/catalogManagement/v2",
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	ContentType = "application/json",
	ReqList = product_offer(),
	ReqBody = lists:flatten(mochijson:encode({struct, ReqList})),
	Request1 = {HostUrl ++ CatalogHref ++ "/productOffering",
			[Accept, auth_header()], ContentType, ReqBody},
	{ok, Result} = httpc:request(post, Request1, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, _} = Result,
	{_, _Href} = lists:keyfind("location", 1, Headers).

get_offer() ->
	[{userdata, [{doc,"Get offer for given Offer Id"}]}].

get_offer(Config) ->
	CatalogHref = "/catalogManagement/v2",
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	ContentType = "application/json",
	ReqList = product_offer(),
	ReqBody = lists:flatten(mochijson:encode({struct, ReqList})),
	Request1 = {HostUrl ++ CatalogHref ++ "/productOffering",
			[Accept, auth_header()], ContentType, ReqBody},
	{ok, Result} = httpc:request(post, Request1, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, _} = Result,
	{_, Href} = lists:keyfind("location", 1, Headers),
	Request2 = {HostUrl ++ Href, [Accept, auth_header()]},
	{ok, Response} = httpc:request(get, Request2, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers1, RespBody} = Response,
	{_, ContentType} = lists:keyfind("content-type", 1, Headers1),
	{struct, RespList} = mochijson:decode(RespBody),
	true = lists:keymember("id", 1, RespList),
	true = lists:keymember("href", 1, RespList),
	true = (lists:keyfind("name", 1, ReqList) == lists:keyfind("name", 1, RespList)),
	true = (lists:keyfind("version", 1, ReqList) == lists:keyfind("version", 1, RespList)),
	true = (lists:keyfind("isBundle", 1, ReqList) == lists:keyfind("isBundle", 1, RespList)),
	true = (lists:keyfind("lifecycleStatus", 1, ReqList) == lists:keyfind("lifecycleStatus", 1, RespList)),
	case {lists:keyfind("validFor", 1, ReqList), lists:keyfind("validFor", 1, RespList)} of
		{{_, {struct, ValidFor1}}, {_, {struct, ValidFor2}}} ->
			true = (lists:keyfind("startDateTime", 1, ValidFor1) == lists:keyfind("startDateTime", 1, ValidFor2)),
			true = (lists:keyfind("endDateTime", 1, ValidFor1) == lists:keyfind("endDateTime", 1, ValidFor2));
		{false, false} ->
			true
	end,
	{_, {struct, ProdSpec1}} = lists:keyfind("productSpecification", 1, ReqList),
	{_, {struct, ProdSpec2}} = lists:keyfind("productSpecification", 1, RespList),
	true = (lists:keyfind("id", 1, ProdSpec1) == lists:keyfind("id", 1, ProdSpec2)),
	true = (lists:keyfind("href", 1, ProdSpec1) == lists:keyfind("href", 1, ProdSpec2)),
	{_, {array, POP1}} = lists:keyfind("productOfferingPrice", 1, ReqList),
	{_, {array, POP2}} = lists:keyfind("productOfferingPrice", 1, RespList),
	F1 = fun({{struct, L1}, {struct, L2}}) ->
		true = (lists:keyfind("name", 1, L1) == lists:keyfind("name", 1 , L2)),
		true = (lists:keyfind("description", 1, L1) == lists:keyfind("description", 1 , L2)),
		case {lists:keyfind("validFor", 1, L1), lists:keyfind("validFor", 1, L2)} of
			{{_, {struct, V1}}, {_, {struct, V2}}} ->
				true = (lists:keyfind("startDateTime", 1, V1) == lists:keyfind("startDateTime", 1, V2)),
				true = (lists:keyfind("endDateTime", 1, V1) == lists:keyfind("endDateTime", 1, V2));
			{false, false} ->
				true
		end,
		case {lists:keyfind("price", 1, L1), lists:keyfind("price", 1, L2)} of
			{{_, {struct, P1}}, {_, {struct, P2}}} ->
				true = (lists:keyfind("taxIncludedAmount", 1, P1) == lists:keyfind("taxIncludedAmount", 1, P2)),
				true = (lists:keyfind("dutyFreeAmount", 1, P1) == lists:keyfind("dutyFreeAmount", 1, P2)),
				true = (lists:keyfind("taxRate", 1, P1) == lists:keyfind("taxRate", 1, P2)),
				true = (lists:keyfind("currencyCode", 1, P1) == lists:keyfind("currencyCode", 1, P2));
			{false, false} ->
				true
		end,
		Fm = fun(U) ->
				case lists:last(U) of
					$b ->
						list_to_integer(lists:sublist(U, length(U) - 1));
					$k ->
						list_to_integer(lists:sublist(U, length(U) - 1)) * 1000;
					$m ->
						list_to_integer(lists:sublist(U, length(U) - 1)) * 1000000;
					$g ->
						list_to_integer(lists:sublist(U, length(U) - 1)) * 1000000000;
					_ ->
						list_to_integer(U)
				end
		end,
		case {lists:keyfind("unitOfMeasure", 1, L1), lists:keyfind("unitOfMeasure", 1, L2)} of
			{{_, UoM}, {_, UoM}} ->
				true;
			{{_, UoM1}, {_, UoM2}} ->
				true = (Fm(UoM1) == Fm(UoM2));
			{false, false} ->
				true
		end,
		true = (lists:keyfind("recurringChargePeriod", 1, L1) == lists:keyfind("recurringChargePeriod", 1, L2)),
		case {lists:keyfind("productOfferPriceAlteration", 1, L1), lists:keyfind("productOfferPriceAlteration", 1, L2)} of
			{{_, {struct, A1}}, {_, {struct, A2}}} ->
				true = (lists:keyfind("name", 1, A1) == lists:keyfind("name", 1, A2)),
				true = (lists:keyfind("description", 1, A1) == lists:keyfind("description", 1, A2)),
				case {lists:keyfind("validFor", 1, A1), lists:keyfind("validFor", 1, A2)} of
					{{_, {struct, AV1}}, {_, {struct, AV2}}} ->
						true = (lists:keyfind("startDateTime", 1, AV1) == lists:keyfind("startDateTime", 1, AV2)),
						true = (lists:keyfind("endDateTime", 1, AV1) == lists:keyfind("endDateTime", 1, AV2));
					{false, false} ->
						true
				end,
				true = (lists:keyfind("priceType", 1, A1) == lists:keyfind("priceType", 1, A2)),
				case {lists:keyfind("price", 1, A1), lists:keyfind("price", 1, A2)} of
					{{_, {struct, AP1}}, {_, {struct, AP2}}} ->
						true = (lists:keyfind("taxIncludedAmount", 1, AP1) == lists:keyfind("taxIncludedAmount", 1, AP2)),
						true = (lists:keyfind("dutyFreeAmount", 1, AP1) == lists:keyfind("dutyFreeAmount", 1, AP2)),
						true = (lists:keyfind("taxRate", 1, AP1) == lists:keyfind("taxRate", 1, AP2)),
						true = (lists:keyfind("currencyCode", 1, AP1) == lists:keyfind("currencyCode", 1, AP2)),
						true = (lists:keyfind("percentage", 1, AP1) == lists:keyfind("percentage", 1, AP2));
					{false, false} ->
						true
				end,
				case {lists:keyfind("unitOfMeasure", 1, A1), lists:keyfind("unitOfMeasure", 1, A2)} of
					{{_, AUoM}, {_, AUoM}} ->
						true;
					{{_, AUoM1}, {_, AUoM2}} ->
						true = (Fm(AUoM1) == Fm(AUoM2));
					{false, false} ->
						true
				end,
				true = (lists:keyfind("recurringChargePeriod", 1, A1) == lists:keyfind("recurringChargePeriod", 1, A2));
			{false, false} ->
				true
		end
	end,
	true = lists:all(F1, lists:zip(POP1, POP2)).

update_offer() ->
	[{userdata, [{doc,"Use PATCH for update product offering entity"}]}].

update_offer(Config) ->
	CatalogHref = "/catalogManagement/v2",
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	ContentType = "application/json",
	RestPort = ?config(port, Config),
	ReqList = product_offer(),
	ReqBody = lists:flatten(mochijson:encode({struct, ReqList})),
	Request1 = {HostUrl ++ CatalogHref ++ "/productOffering",
			[Accept, auth_header()], ContentType, ReqBody},
	{ok, Result} = httpc:request(post, Request1, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, ResponseBody} = Result,
	{_, _Href} = lists:keyfind("location", 1, Headers),
	{_, Etag} = lists:keyfind("etag", 1, Headers),
	{struct, Product1} = mochijson:decode(ResponseBody),
	RestPort = ?config(port, Config),
	{_, ProductName} = lists:keyfind("name", 1, Product1),
	SslSock = ssl_socket_open({127,0,0,1}, RestPort),
	PatchContentType = "application/json-patch+json",
	Json = {array, [product_description(), product_status(),
			prod_price_name(), prod_price_description(),
			prod_price_ufm(), prod_price_type(), pp_alter_description(),
			pp_alter_type(), pp_alter_ufm(), prod_price_rc_period()]},
	Body = lists:flatten(mochijson:encode(Json)),
	{Headers2, _Response2} = patch_request(SslSock,
			RestPort, PatchContentType, Etag, basic_auth(), ProductName, Body),
	<<"HTTP/1.1 200", _/binary>> = Headers2,
	ok = ssl_socket_close(SslSock).

delete_offer() ->
	[{userdata, [{doc,"Delete offer for given Offer Id"}]}].

delete_offer(Config) ->
	P1 = price(usage, octets, rand:uniform(1000), rand:uniform(100)),
	OfferId = offer_add([P1], 4),
	{ok, #offer{}} = ocs:find_offer(OfferId),
	HostUrl = ?config(host_url, Config),
	URI = "/catalogManagement/v2/productOffering/" ++ OfferId,
	Request = {HostUrl ++ URI, [auth_header()]},
	{ok, Result} = httpc:request(delete, Request, [], []),
	{{"HTTP/1.1", 204, _NoContent}, Headers, []} = Result,
	{_, "0"} = lists:keyfind("content-length", 1, Headers),
	{error, not_found} = ocs:find_offer(OfferId).

ignore_delete_offer() ->
	[{userdata, [{doc,"Ignore delete offer for given Offer Id,
			if any product related to offer"}]}].

ignore_delete_offer(Config) ->
	P1 = price(usage, octets, rand:uniform(1000), rand:uniform(100)),
	OfferId = offer_add([P1], 4),
	{ok, #offer{}} = ocs:find_offer(OfferId),
	_ProdRef = product_add(OfferId),
	HostUrl = ?config(host_url, Config),
	URI = "/catalogManagement/v2/productOffering/" ++ OfferId,
	Request = {HostUrl ++ URI, [auth_header()]},
	{ok, Result} = httpc:request(delete, Request, [], []),
	{{"HTTP/1.1", 202, _Accepted}, _Headers, _} = Result,
	{ok, #offer{}} = ocs:find_offer(OfferId).

add_product() ->
	[{userdata, [{doc,"Create a new product inventory."}]}].

add_product(Config) ->
	P1 = price(one_time, undefined, rand:uniform(1000), rand:uniform(100)),
	P2 = price(usage, octets, rand:uniform(1000000), rand:uniform(500)),
	OfferId = offer_add([P1, P2], 4),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	ContentType = "application/json",
	InventoryHref = "/productInventoryManagement/v2",
	ProdOffer = {"productOffering", {struct,[{"id", OfferId}, {"name", OfferId},
			{"href","/catalogManagement/v2/productOffering/" ++ OfferId}]}},
	StartDate = {"startDate", ocs_rest:iso8601(erlang:system_time(?MILLISECOND))},
	EndDate = {"terminationDate", ocs_rest:iso8601(erlang:system_time(?MILLISECOND) + 10000000)},
	Inventory = {struct, [ProdOffer, StartDate, EndDate]},
	ReqBody = lists:flatten(mochijson:encode(Inventory)),
	Request1 = {HostUrl ++ InventoryHref ++ "/product",
			[Accept, auth_header()], ContentType, ReqBody},
	{ok, Result} = httpc:request(post, Request1, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, _} = Result,
	{_, Href} = lists:keyfind("location", 1, Headers),
	InventoryId = lists:last(string:tokens(Href, "/")),
	{ok, #product{product = OfferId}} = ocs:find_product(InventoryId).

get_product() ->
	[{userdata, [{doc,"Get product inventory
			with given product inventory reference"}]}].

get_product(Config) ->
	P1 = price(one_time, undefined, rand:uniform(1000), rand:uniform(100)),
	P2 = price(usage, octets, rand:uniform(1000000), rand:uniform(500)),
	OfferId = offer_add([P1, P2], 4),
	ProdRef = product_add(OfferId),
	ServiceId = service_add(ProdRef),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Request = {HostUrl ++ "/productInventoryManagement/v2/product/" ++ ProdRef,
			[Accept, auth_header()]},
	{ok, Result} = httpc:request(get, Request, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers, ResponseBody} = Result,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers),
	{struct, Object} = mochijson:decode(ResponseBody),
	{_, ProdRef} = lists:keyfind("id", 1, Object),
	{_, "/productInventoryManagement/v2/product/" ++ ProdRef} = lists:keyfind("href", 1, Object),
	{_, {struct, ProductOffering}} = lists:keyfind("productOffering", 1, Object),
	{_, OfferId} = lists:keyfind("id", 1, ProductOffering),
	{_, "/catalogManagement/v2/productOffering/" ++ OfferId} = lists:keyfind("href", 1, ProductOffering),
	{_, {array, RealizeingServices}} = lists:keyfind("realizingService", 1, Object),
	F = fun({struct, [{"id", SId}, {"href","/serviceInventoryManagement/v2/service/" ++ SId}]})
					when ServiceId == SId ->
				true;
			(_) ->
				false
	end,
	true = lists:all(F, RealizeingServices).

update_product_realizing_service() ->
	[{userdata, [{doc,"Use PATCH for update product inventory realizing services"}]}].

update_product_realizing_service(Config) ->
	P1 = price(usage, octets, rand:uniform(1000000), rand:uniform(100)),
	OfferId = offer_add([P1], 4),
	ProdRef = product_add(OfferId),
	ServiceId = ocs:generate_identity(),
	{ok, #service{}}	= ocs:add_service(ServiceId, ocs:generate_password(), undefined, []),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Request2 = {HostUrl ++ "/productInventoryManagement/v2/product/" ++ ProdRef,
			[Accept, auth_header()]},
	{ok, Result1} = httpc:request(get, Request2, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers1, _} = Result1,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers1),
	{_, Etag} = lists:keyfind("etag", 1, Headers1),
	NewRSObj = {struct, [{"id", ServiceId},
			{"href", "/serviceInventoryManagement/v2/service/"++ ServiceId}]},
	JSON = {array, [{struct, [{op, "add"},
			{path, "/realizingService/-"},
			{value, NewRSObj}]}]},
	Body = lists:flatten(mochijson:encode(JSON)),
	Length= size(list_to_binary(Body)),
	Port = ?config(port, Config),
	SslSock = ssl_socket_open({127,0,0,1}, Port),
	ContentType = "application/json-patch+json",
	Timeout = 1500,
	PatchURI = "/productInventoryManagement/v2/product/" ++ ProdRef,
	Request =
			["PATCH ", PatchURI, " HTTP/1.1",$\r,$\n,
			"Content-Type:"++ ContentType, $\r,$\n,
			"Accept:application/json",$\r,$\n,
			"Authorization:"++ basic_auth(),$\r,$\n,
			"Host:localhost:" ++ integer_to_list(Port),$\r,$\n,
			"Content-Length:" ++ integer_to_list(Length),$\r,$\n,
			"If-match:" ++ Etag,$\r,$\n,
			$\r,$\n,
			Body],
	ok = ssl:send(SslSock, Request),
	F2 = fun F2(_Sock, {error, timeout}, Acc) ->
					lists:reverse(Acc);
			F2(Sock, {ok, Bin}, Acc) ->
					F2(Sock, ssl:recv(Sock, 0, Timeout), [Bin | Acc])
	end,
	RecvBuf = F2(SslSock, ssl:recv(SslSock, 0, Timeout), []),
	PatchResponse = list_to_binary(RecvBuf),
	[Headers, ResponseBody] = binary:split(PatchResponse, <<$\r,$\n,$\r,$\n>>),
	<<"HTTP/1.1 200", _/binary>> = Headers,
	{struct, PatchObj} = mochijson:decode(ResponseBody),
	{_, {array, RealizeingServices}} = lists:keyfind("realizingService", 1, PatchObj),
	F3 = fun({struct, Obj}) ->
			try
				{_, ServiceId} = lists:keyfind("id", 1, Obj),
				{_, "/serviceInventoryManagement/v2/service/" ++ ServiceId} = lists:keyfind("href", 1, Obj),
				true
			catch
				_:_ ->
					false
			end
	end,
	true = lists:all(F3, RealizeingServices),
	ok = ssl_socket_close(SslSock).

delete_product() ->
	[{userdata, [{doc,"Delete product inventory"}]}].

delete_product(Config) ->
	P1 = price(usage, octets, rand:uniform(10000), rand:uniform(100)),
	OfferId = offer_add([P1], 4),
	ProdRef = product_add(OfferId),
	{_, #product{}} = ocs:find_product(ProdRef),
	URI = "/productInventoryManagement/v2/product/" ++ ProdRef,
	HostUrl = ?config(host_url, Config),
	Request = {HostUrl ++ URI, [auth_header()]},
	{ok, Result} = httpc:request(delete, Request, [], []),
	{{"HTTP/1.1", 204, _NoContent}, Headers, []} = Result,
	{_, "0"} = lists:keyfind("content-length", 1, Headers),
	{error, not_found} = ocs:find_product(ProdRef).

ignore_delete_product() ->
	[{userdata, [{doc,"ignore Delete product inventory if
			service any service related with product inventory"}]}].

ignore_delete_product(Config) ->
	P1 = price(usage, octets, rand:uniform(10000), rand:uniform(100)),
	OfferId = offer_add([P1], 4),
	ServiceId = service_add(undefined),
	{ok, #product{id = ProdRef}} =
			ocs:add_product(OfferId, [list_to_binary(ServiceId)]),
	URI = "/productInventoryManagement/v2/product/" ++ ProdRef,
	HostUrl = ?config(host_url, Config),
	Request = {HostUrl ++ URI, [auth_header()]},
	{ok, Result} = httpc:request(delete, Request, [], []),
	{{"HTTP/1.1", 202, _Accepted}, _Headers, _} = Result,
	{ok, #product{}} = ocs:find_product(ProdRef).

query_product() ->
	[{userdata, [{doc, "Query product entry in product table"}]}].

query_product(Config) ->
	F = fun F(0, Acc) ->
					Acc;
			F(N, Acc) ->
				Price1 = #price{name = ocs:generate_identity(), units = octets,
						type = one_time, amount = rand:uniform(100)},
				Prices = [Price1],
				OfferId = ocs:generate_identity(),
				Offer = #offer{name = OfferId,
						status = active, price = Prices, specification = "PrepaidVoiceProductSpec"},
				{ok, _Offer1} = ocs:add_offer(Offer),
				{ok, P} = ocs:add_product(OfferId, []),
				P1 = P#product{service = [list_to_binary(ocs:generate_identity()) || _ <- lists:seq(1, 5)]},
				mnesia:dirty_write(product, P1),
				F(N -1, [P1 | Acc])
	end,
	Products = F(rand:uniform(100), []),
	#product{id = Id, service = Services, product = Offer} = lists:nth(rand:uniform(length(Products)), Products),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Query = "id=" ++ Id ++ "&productOffering=" ++ Offer ++ 
		"&service=" ++  binary_to_list(lists:nth(rand:uniform(length(Services)), Services)),
	Request = {HostUrl ++ "/productInventoryManagement/v2/product?" ++ Query,
			[Accept, auth_header()]},
	{ok, Result} = httpc:request(get, Request, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers, ResponseBody} = Result,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers),
	{array, [{struct, Object}]} = mochijson:decode(ResponseBody),
	{_, Id} = lists:keyfind("id", 1, Object),
	{_, "/productInventoryManagement/v2/product/" ++ Id} = lists:keyfind("href", 1, Object),
	{_, {struct, ProdOffer}} = lists:keyfind("productOffering", 1, Object),
	{_, Offer} = lists:keyfind("id", 1, ProdOffer).

filter_product() ->
	[{userdata, [{doc, "Filter product inventory ids"}]}].

filter_product(Config) ->
	F = fun F(0, Acc) ->
					Acc;
			F(N, Acc) ->
				Price1 = #price{name = ocs:generate_identity(), units = cents,
						type = one_time, amount = rand:uniform(100)},
				Prices = [Price1],
				OfferId = ocs:generate_identity(),
				Offer = #offer{name = OfferId,
						status = active, price = Prices, specification = "PrepaidVoiceProductSpec"},
				{ok, _Offer1} = ocs:add_offer(Offer),
				{ok, P} = ocs:add_product(OfferId, []),
				F(N -1, [{P#product.id} | Acc])
	end,
	ProdRefs1 = F(1, []),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Filter = "?filter=\"[{id.like=[1%25]}]\"",
	Url = HostUrl ++ "/productInventoryManagement/v2/product" ++ Filter,
	Request = {Url, [Accept, auth_header()]},
	{ok, Result} = httpc:request(get, Request, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers, ResponseBody} = Result,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers),
	{array, Objects} = mochijson:decode(ResponseBody),
	ProdRefs2 = [Id || {struct, [{"id", Id}]} <- Objects],
	ProdRefs3 = ProdRefs1 -- ProdRefs2.

add_product_sms(Config) ->
	CatalogHref = "/catalogManagement/v2",
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	ContentType = "application/json",
	ProdId = ocs:generate_identity(),
	ProdName = {"name", ProdId},
	ProdDescirption = {"description", ocs:generate_password()},
	IsBundle = {"isBundle", false},
	IsCustomerVisible = {"isCustomerVisible", true},
	Status = {"lifecycleStatus", "Active"},
	StartTime = {"startDateTime", ocs_rest:iso8601(erlang:system_time(?MILLISECOND))},
	EndTime = {"endDateTime", ocs_rest:iso8601(erlang:system_time(?MILLISECOND)  + 2678400000)},
	ValidFor = {"validFor", {struct, [StartTime, EndTime]}},
	ProdSpecID = {"id", "11"},
	ProdSpecHref = {"href", CatalogHref ++ "/productSpecification/11"},
	ProdSpec = {"productSpecification", {struct, [ProdSpecID, ProdSpecHref]}},
	POPName = {"name", "usage"},
	POPDescription = {"description", ocs:generate_password()},
	POPStratDateTime = {"startDateTime", ocs_rest:iso8601(erlang:system_time(?MILLISECOND))},
	POPEndDateTime = {"endDateTime", ocs_rest:iso8601(erlang:system_time(?MILLISECOND)  + 2678400000)},
	POPValidFor = {"validFor", {struct, [POPStratDateTime, POPEndDateTime]}},
	POPPriceType = {"priceType", "usage"},
	POPUOMeasure = {"unitOfMeasure", "10msg"},
	POPPriceTaxInclude = {"taxIncludedAmount",
			integer_to_list(rand:uniform(1000)) ++ "." ++ integer_to_list(rand:uniform(999999))},
	POPPriceCurrency = {"currencyCode", "USD"},
	POPPrice = {"price", {struct, [POPPriceTaxInclude, POPPriceCurrency]}},
	ProdOfferPrice1 = {struct, [POPName, POPDescription, POPValidFor, POPPriceType,
			POPPrice, POPUOMeasure]},
	ProdOfferPrice = {"productOfferingPrice", {array, [ProdOfferPrice1]}},
	ReqList = [ProdName, ProdDescirption, IsBundle, IsCustomerVisible, ValidFor, ProdSpec, Status, ProdOfferPrice],
	ReqBody = lists:flatten(mochijson:encode({struct, ReqList})),
	Request1 = {HostUrl ++ CatalogHref ++ "/productOffering",
			[Accept, auth_header()], ContentType, ReqBody},
	{ok, Result} = httpc:request(post, Request1, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, _} = Result,
	{_, _Href} = lists:keyfind("location", 1, Headers).

add_service_inventory() ->
	[{userdata, [{doc,"Add service inventory"}]}].

add_service_inventory(Config) ->
	OfferId = ?config(product_id, Config),
	{ok, #product{}} = ocs:add_product(OfferId, []),
	ID = ocs:generate_identity(),
	Password = ocs:generate_password(),
	State = {"state", active},
	IsServiceEnabled = {"isServiceEnabled", true},
	Char1= {struct, [{"name", "acctSessionInterval"}, {"value", rand:uniform(500)}]},
	Char2 = {struct, [{"name", "sessionTimeout"}, {"value", rand:uniform(2500)}]},
	Char3 = {struct, [{"name", "serviceIdentity"}, {"value", ID}]},
	Char4 = {struct, [{"name", "servicePassword"}, {"value", Password}]},
	Char5 = {struct, [{"name", "multiSession"}, {"value", true}]},
	Char6 = {struct, [{"name", "radiusReserveOctets"},
			{"value", {struct, [{"unitOfMeasure", "bytes"},
			{"value", rand:uniform(100000)}]}}]},
	SortedChars = lists:sort([Char1, Char2, Char3, Char4, Char5, Char6]),
	Characteristics = {"serviceCharacteristic", {array, SortedChars}},
	JSON = {struct, [State, IsServiceEnabled, Characteristics]},
	RequestBody = lists:flatten(mochijson:encode(JSON)),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	ContentType = "application/json",
	Request = {HostUrl ++ "/serviceInventoryManagement/v2/service",
			[Accept, auth_header()], ContentType, RequestBody},
	{ok, Result} = httpc:request(post, Request, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, ResponseBody} = Result,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers),
	{_, _} = lists:keyfind("etag", 1, Headers),
	{_, URI} = lists:keyfind("location", 1, Headers),
	{"/serviceInventoryManagement/v2/service/" ++ ID, _} = httpd_util:split_path(URI),
	ContentLength = integer_to_list(length(ResponseBody)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{struct, Object} = mochijson:decode(ResponseBody),
	{"id", ID} = lists:keyfind("id", 1, Object),
	{_, URI} = lists:keyfind("href", 1, Object),
	{_, {array, Chars}} = lists:keyfind("serviceCharacteristic", 1, Object),
	SortedChars = lists:sort(Chars).

add_service_inventory_without_password() ->
	[{userdata, [{doc,"Add service inventory with out servicePassword characteristic"}]}].

add_service_inventory_without_password(Config) ->
	OfferId = ?config(product_id, Config),
	{ok, #product{}} = ocs:add_product(OfferId, []),
	ID = ocs:generate_identity(),
	State = {"state", active},
	IsServiceEnabled = {"isServiceEnabled", true},
	Char1= {struct, [{"name", "acctSessionInterval"}, {"value", rand:uniform(500)}]},
	Char2 = {struct, [{"name", "sessionTimeout"}, {"value", rand:uniform(2500)}]},
	Char3 = {struct, [{"name", "serviceIdentity"}, {"value", ID}]},
	Char4 = {struct, [{"name", "multiSession"}, {"value", true}]},
	SortedChars = lists:sort([Char1, Char2, Char3, Char4]),
	Characteristics = {"serviceCharacteristic", {array, SortedChars}},
	JSON = {struct, [State, IsServiceEnabled, Characteristics]},
	RequestBody = lists:flatten(mochijson:encode(JSON)),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	ContentType = "application/json",
	Request = {HostUrl ++ "/serviceInventoryManagement/v2/service",
			[Accept, auth_header()], ContentType, RequestBody},
	{ok, Result} = httpc:request(post, Request, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, ResponseBody} = Result,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers),
	{_, _} = lists:keyfind("etag", 1, Headers),
	{_, URI} = lists:keyfind("location", 1, Headers),
	{"/serviceInventoryManagement/v2/service/" ++ ID, _} = httpd_util:split_path(URI),
	ContentLength = integer_to_list(length(ResponseBody)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{struct, Object} = mochijson:decode(ResponseBody),
	{"id", ID} = lists:keyfind("id", 1, Object),
	{_, URI} = lists:keyfind("href", 1, Object),
	{_, {array, Chars}} = lists:keyfind("serviceCharacteristic", 1, Object),
	F = fun({struct, [{"name", "servicePassword"}, {"value", Password}]}) ->
					12 == length(Password);
			({struct, [{"value", Password}, {"name", "servicePassword"}]}) ->
					12 == length(Password);
			(_) ->
				false
	end,
	lists:any(F, Chars).

add_service_aka() ->
	[{userdata, [{doc,"Add service with IMSI and AKA"}]}].

add_service_aka(Config) ->
	IMSI = "001001" ++ ocs:generate_identity(),
	K = binary_to_hex(crypto:strong_rand_bytes(16)),
	OPc = binary_to_hex(crypto:strong_rand_bytes(16)),
	Credentials = #aka_cred{k = K, opc = OPc},
	State = {"state", active},
	IsServiceEnabled = {"isServiceEnabled", true},
	Char1 = {struct, [{"name", "serviceIdentity"}, {"value", IMSI}]},
	Char2 = {struct, [{"name", "serviceAkaK"}, {"value", K}]},
	Char3 = {struct, [{"name", "serviceAkaOpc"}, {"value", OPc}]},
	Char4 = {struct, [{"name", "multiSession"}, {"value", true}]},
	SortedChars = lists:sort([Char1, Char2, Char3, Char4]),
	Characteristics = {"serviceCharacteristic", {array, SortedChars}},
	JSON = {struct, [State, IsServiceEnabled, Characteristics]},
	RequestBody = lists:flatten(mochijson:encode(JSON)),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	ContentType = "application/json",
	Request = {HostUrl ++ "/serviceInventoryManagement/v2/service",
			[Accept, auth_header()], ContentType, RequestBody},
	{ok, Result} = httpc:request(post, Request, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, ResponseBody} = Result,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers),
	{_, _} = lists:keyfind("etag", 1, Headers),
	{_, URI} = lists:keyfind("location", 1, Headers),
	{"/serviceInventoryManagement/v2/service/" ++ IMSI, _} = httpd_util:split_path(URI),
	ContentLength = integer_to_list(length(ResponseBody)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{struct, Object} = mochijson:decode(ResponseBody),
	{"id", IMSI} = lists:keyfind("id", 1, Object),
	{_, URI} = lists:keyfind("href", 1, Object),
	{_, {array, Chars}} = lists:keyfind("serviceCharacteristic", 1, Object),
	SortedChars1 = lists:sort(Chars).

get_service_inventory() ->
	[{userdata, [{doc,"get service invetory for spefici service id"}]}].

get_service_inventory(Config) ->
	OfferId = ?config(product_id, Config),
	{ok, #product{id = ProdRef}} = ocs:add_product(OfferId, []),
	ID = ocs:generate_identity(),
	Password = ocs:generate_password(),
	State = active,
	SessionTimeout = rand:uniform(2500),
	AcctInterimInterval = rand:uniform(500),
	Attributes = [{?SessionTimeout, SessionTimeout},
			{?AcctInterimInterval, AcctInterimInterval}],
	{ok, #service{}} = ocs:add_service(ID, Password, State, ProdRef, [], Attributes, true, false),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Request = {HostUrl ++ "/serviceInventoryManagement/v2/service/" ++ ID,
			[Accept, auth_header()]},
	{ok, Result} = httpc:request(get, Request, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers, ResponseBody} = Result,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers),
	{_, _} = lists:keyfind("etag", 1, Headers),
	{_, URI} = lists:keyfind("location", 1, Headers),
	{"/serviceInventoryManagement/v2/service/" ++ ID, _} = httpd_util:split_path(URI),
	ContentLength = integer_to_list(length(ResponseBody)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{struct, Object} = mochijson:decode(ResponseBody),
	{"id", ID} = lists:keyfind("id", 1, Object),
	{_, URI} = lists:keyfind("href", 1, Object),
	{"state", _} = lists:keyfind("state", 1, Object),
	{"isServiceEnabled", true} = lists:keyfind("isServiceEnabled", 1, Object),
	{_, {array, Chars}} = lists:keyfind("serviceCharacteristic", 1, Object),
	F = fun({struct, [{"name", "serviceIdentity"}, {"value", ID1}]}) when ID1 == ID ->
				true;
			({struct, [{"name", "servicePassword"}, {"value", Password1}]}) when Password1 == Password ->
				true;
			({struct, [{"name", "multiSession"}, {"value", false}]}) ->
				true;
			({struct, [{"name", "acctSessionInterval"}, {"value", AcctInterimInterval1}]})
					when AcctInterimInterval1 == AcctInterimInterval ->
				true;
			({struct, [{"name", "sessionTimeout"}, {"value", SessionTimeout1}]})
					when SessionTimeout1 == SessionTimeout ->
				true;
			({struct, [{"value", ID1}, {"name", "serviceIdentity"}]}) when ID1 == ID ->
				true;
			({struct, [{"value", Password1}, {"name", "servicePassword"}]}) when Password1 == Password ->
				true;
			({struct, [{"value", false}, {"name", "multiSession"}]}) ->
				true;
			({struct, [{"value", AcctInterimInterval1}, {"name", "acctSessionInterval"}]})
					when AcctInterimInterval1 == AcctInterimInterval ->
				true;
			({struct, [{"value", SessionTimeout1}, {"name", "sessionTimeout"}]})
					when SessionTimeout1 == SessionTimeout ->
				true;
			(_) ->
				false
	end,
	true = lists:all(F, Chars).

get_service_not_found() ->
	[{userdata, [{doc, "Get service notfound for given service id"}]}].

get_service_not_found(Config) ->
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	ID = ocs:generate_identity(),
	Request = {HostUrl ++ "/serviceInventoryManagement/v2/service/" ++ ID, [Accept, auth_header()]},
	{ok, Result} = httpc:request(get, Request, [], []),
	{{"HTTP/1.1", 404, _NotFound}, _Headers, _Body} = Result.

get_all_service_inventories() ->
	[{userdata, [{doc,"Get all service inventories"}]}].

get_all_service_inventories(Config) ->
	OfferId = ?config(product_id, Config),
	{ok, #product{id = ProdRef1}} = ocs:add_product(OfferId, []),
	{ok, #product{id = ProdRef2}} = ocs:add_product(OfferId, []),
	{ok, #product{id = ProdRef3}} = ocs:add_product(OfferId, []),
	{ok, #product{id = ProdRef4}} = ocs:add_product(OfferId, []),
	{ok, #product{id = ProdRef5}} = ocs:add_product(OfferId, []),
	ID1 = ocs:generate_identity(),
	ID2 = ocs:generate_identity(),
	ID3 = ocs:generate_identity(),
	ID4 = ocs:generate_identity(),
	ID5 = ocs:generate_identity(),
	Password1 = ocs:generate_password(),
	Password2 = ocs:generate_password(),
	Password3 = ocs:generate_password(),
	Password4 = ocs:generate_password(),
	Password5 = ocs:generate_password(),
	SessionTimeout1 = rand:uniform(2500),
	SessionTimeout2 = rand:uniform(2500),
	SessionTimeout3 = rand:uniform(2500),
	SessionTimeout4 = rand:uniform(2500),
	SessionTimeout5 = rand:uniform(2500),
	AcctInterimInterval1 = rand:uniform(500),
	AcctInterimInterval2 = rand:uniform(500),
	AcctInterimInterval3 = rand:uniform(500),
	AcctInterimInterval4 = rand:uniform(500),
	AcctInterimInterval5 = rand:uniform(500),
	Attributes1 = [{?SessionTimeout, SessionTimeout1}, {?AcctInterimInterval, AcctInterimInterval1}],
	Attributes2 = [{?SessionTimeout, SessionTimeout2}, {?AcctInterimInterval, AcctInterimInterval2}],
	Attributes3 = [{?SessionTimeout, SessionTimeout3}, {?AcctInterimInterval, AcctInterimInterval3}],
	Attributes4 = [{?SessionTimeout, SessionTimeout4}, {?AcctInterimInterval, AcctInterimInterval4}],
	Attributes5 = [{?SessionTimeout, SessionTimeout5}, {?AcctInterimInterval, AcctInterimInterval5}],
	{ok, #service{}} = ocs:add_service(ID1, Password1, active, ProdRef1, [], Attributes1, true, false),
	{ok, #service{}} = ocs:add_service(ID2, Password2, active, ProdRef2, [], Attributes2, true, false),
	{ok, #service{}} = ocs:add_service(ID3, Password3, active, ProdRef3, [], Attributes3, true, false),
	{ok, #service{}} = ocs:add_service(ID4, Password4, active, ProdRef4, [], Attributes4, true, false),
	{ok, #service{}} = ocs:add_service(ID5, Password5, active, ProdRef5, [], Attributes5, true, false),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Request = {HostUrl ++ "/serviceInventoryManagement/v2/service/", [Accept, auth_header()]},
	{ok, Result} = httpc:request(get, Request, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers, ResponseBody} = Result,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers),
	{_, _} = lists:keyfind("etag", 1, Headers),
	ContentLength = integer_to_list(length(ResponseBody)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{array, Objects} = mochijson:decode(ResponseBody),
	F2 = fun(Obj, ID, Password, Attributes) ->
					{"state", _} = lists:keyfind("state", 1, Obj),
					{"isServiceEnabled", true} = lists:keyfind("isServiceEnabled", 1, Obj),
					{_, {array, Chars}} = lists:keyfind("serviceCharacteristic", 1, Obj),
						F3 = fun({struct, [{"name", "serviceIdentity"}, {"value", ID6}]}) when ID6 == ID ->
									true;
								({struct, [{"name", "servicePassword"}, {"value", Password6}]}) when Password6 == Password ->
									true;
								({struct, [{"name", "multiSession"}, {"value", false}]}) ->
									true;
								({struct, [{"name", "acctSessionInterval"}, {"value", AcctInterimInterval6}]}) ->
										case lists:keyfind(?AcctInterimInterval, 1, Attributes) of
											{_, AcctInterimInterval6} ->
												true;
											_ ->
												false
										end;
								({struct, [{"name", "sessionTimeout"}, {"value", SessionTimeout6}]}) ->
										case lists:keyfind(?SessionTimeout, 1, Attributes) of
											{_, SessionTimeout6} ->
												true;
											_ ->
												false
										end;
								({struct, [{"value", ID6}, {"name", "serviceIdentity"}]}) when ID6 == ID ->
									true;
								({struct, [{"value", Password6}, {"name", "servicePassword"}]}) when Password6 == Password ->
									true;
								({struct, [{"value", false}, {"name", "multiSession"}]}) ->
									true;
								({struct, [{"value", AcctInterimInterval6}, {"name", "acctSessionInterval"}]}) ->
										case lists:keyfind(?AcctInterimInterval, 1, Attributes) of
											{_, AcctInterimInterval6} ->
												true;
											_ ->
												false
										end;
								({struct, [{"value", SessionTimeout6}, {"name", "sessionTimeout"}]}) ->
										case lists:keyfind(?SessionTimeout, 1, Attributes) of
											{_, SessionTimeout6} ->
												true;
											_ ->
												false
										end;
								(_) ->
									false
						end,
						true = lists:all(F3, Chars)
	end,
	F = fun({struct, Object}) ->
				case lists:keyfind("id", 1, Object) of
					{_, ID6} when ID6 == ID1 ->
						F2(Object, ID1, Password1, Attributes1);
					{_, ID6} when ID6 == ID2 ->
						F2(Object, ID2, Password2, Attributes2);
					{_, ID6} when ID6 == ID3 ->
						F2(Object, ID3, Password3, Attributes3);
					{_, ID6} when ID6 == ID4 ->
						F2(Object, ID4, Password4, Attributes4);
					{_, ID6} when ID6 == ID5 ->
						F2(Object, ID5, Password5, Attributes5);
					_ ->
						true
				end
	end,
	true = lists:all(F, Objects).

get_service_range() ->
	[{userdata, [{doc,"Get range of items in the service collection"}]}].

get_service_range(Config) ->
	{ok, PageSize} = application:get_env(ocs, rest_page_size),
	P1 = price(usage, octets, rand:uniform(1000000), rand:uniform(100)),
	OfferId = offer_add([P1], 4),
	ProdRef = product_add(OfferId),
	Fadd = fun(_F, 0) ->
				ok;
			(F, N) ->
				Identity = ocs:generate_identity(),
				Password = ocs:generate_password(),
				{ok, _} = ocs:add_service(Identity, Password, ProdRef, []),
				F(F, N - 1)
	end,
	NumAdded = (PageSize * 2) + (PageSize div 2) + 17,
	ok = Fadd(Fadd, NumAdded),
	RangeSize = case PageSize > 25 of
		true ->
			rand:uniform(PageSize - 10) + 10;
		false ->
			PageSize - 1
	end,
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	RequestHeaders1 = [Accept, auth_header()],
	Request1 = {HostUrl ++ "/serviceInventoryManagement/v2/service/", RequestHeaders1},
	{ok, Result1} = httpc:request(get, Request1, [], []),
	{{"HTTP/1.1", 200, _OK}, ResponseHeaders1, Body1} = Result1,
	{_, Etag} = lists:keyfind("etag", 1, ResponseHeaders1),
	true = is_etag_valid(Etag),
	{_, AcceptRanges1} = lists:keyfind("accept-ranges", 1, ResponseHeaders1),
	true = lists:member("items", string:tokens(AcceptRanges1, ", ")),
	{_, Range1} = lists:keyfind("content-range", 1, ResponseHeaders1),
	["items", "1", RangeEndS1, "*"] = string:tokens(Range1, " -/"),
	RequestHeaders2 = RequestHeaders1 ++ [{"if-match", Etag}],
	PageSize = list_to_integer(RangeEndS1),
	{array, Service1} = mochijson:decode(Body1),
	PageSize = length(Service1),
	Fget = fun Fget(RangeStart2, RangeEnd2) ->
				RangeHeader = [{"range",
						"items " ++ integer_to_list(RangeStart2)
						++ "-" ++ integer_to_list(RangeEnd2)}],
				RequestHeaders3 = RequestHeaders2 ++ RangeHeader,
				Request2 = {HostUrl ++ "/serviceInventoryManagement/v2/service/", RequestHeaders3},
				{ok, Result2} = httpc:request(get, Request2, [], []),
				{{"HTTP/1.1", 200, _OK}, ResponseHeaders2, Body2} = Result2,
				{_, Etag} = lists:keyfind("etag", 1, ResponseHeaders2),
				{_, AcceptRanges2} = lists:keyfind("accept-ranges", 1, ResponseHeaders2),
				true = lists:member("items", string:tokens(AcceptRanges2, ", ")),
				{_, Range} = lists:keyfind("content-range", 1, ResponseHeaders2),
				["items", RangeStartS, RangeEndS, EndS] = string:tokens(Range, " -/"),
				RangeStart2 = list_to_integer(RangeStartS),
				case EndS of
					"*" ->
						RangeEnd2 = list_to_integer(RangeEndS),
						RangeSize = (RangeEnd2 - (RangeStart2 - 1)),
						{array, Service2} = mochijson:decode(Body2),
						RangeSize = length(Service2),
						NewRangeStart = RangeEnd2 + 1,
						NewRangeEnd = NewRangeStart + (RangeSize - 1),
						Fget(NewRangeStart, NewRangeEnd);
					EndS when RangeEndS == EndS ->
						list_to_integer(EndS)
				end
	end,
	CollectionSize = length(ocs:get_services()),
	CollectionSize = Fget(PageSize + 1, PageSize + RangeSize).

delete_service() ->
	[{userdata, [{doc,"Delete subscriber in rest interface"}]}].

delete_service(Config) ->
	P1 = price(usage, octets, rand:uniform(10000), rand:uniform(100)),
	OfferId = offer_add([P1], 4),
	ProdRef = product_add(OfferId),
	ServiceId = service_add(ProdRef),
	{ok, #service{}} = ocs:find_service(ServiceId),
	URI = "/serviceInventoryManagement/v2/service/" ++ ServiceId,
	HostUrl = ?config(host_url, Config),
	Request = {HostUrl ++ URI, [auth_header()]},
	{ok, Result} = httpc:request(delete, Request, [], []),
	{{"HTTP/1.1", 204, _NoContent}, Headers, []} = Result,
	{_, "0"} = lists:keyfind("content-length", 1, Headers).

update_service() ->
	[{userdata, [{doc,"Use HTTP PATCH to update service characteristics
			using json-patch media type"}]}].

update_service(Config) ->
	P1 = price(usage, octets, rand:uniform(10000), rand:uniform(100)),
	OfferId = offer_add([P1], 4),
	ProdRef = product_add(OfferId),
	ServiceId = service_add(ProdRef),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Request2 = {HostUrl ++ "/serviceInventoryManagement/v2/service/" ++ ServiceId,
			[Accept, auth_header()]},
	{ok, Result1} = httpc:request(get, Request2, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers1, Body1} = Result1,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers1),
	{_, Etag} = lists:keyfind("etag", 1, Headers1),
	{struct, Object} = mochijson:decode(Body1),
	{_, {array, Characteristic}} = lists:keyfind("serviceCharacteristic", 1, Object),
	NewPassword = ocs:generate_password(),
	NewPwdObj = {struct, [{"name", "servicePassword"}, {"value", NewPassword}]},
	F1 = fun F1([{struct, [{"name", Name}, _]} | _T], Name, N) ->
				integer_to_list(N);
			F1([{struct, [_, {"name", Name}]} | _T], Name, N) ->
				integer_to_list(N);
			F1([_ | T], Name, N) ->
				F1(T, Name, N + 1);
			F1([], _Name, _N) ->
				"-"
	end,
	IndexPassword= F1(Characteristic, "servicePassword", 0),
	JSON = {array, [{struct, [{op, "replace"},
			{path, "/serviceCharacteristic/" ++ IndexPassword},
			{value, NewPwdObj}]}]},
	Body = lists:flatten(mochijson:encode(JSON)),
	Length= size(list_to_binary(Body)),
	Port = ?config(port, Config),
	SslSock = ssl_socket_open({127,0,0,1}, Port),
	ContentType = "application/json-patch+json",
	Timeout = 1500,
	PatchURI = "/serviceInventoryManagement/v2/service/" ++ ServiceId,
	Request =
			["PATCH ", PatchURI, " HTTP/1.1",$\r,$\n,
			"Content-Type:"++ ContentType, $\r,$\n,
			"Accept:application/json",$\r,$\n,
			"Authorization:"++ basic_auth(),$\r,$\n,
			"Host:localhost:" ++ integer_to_list(Port),$\r,$\n,
			"Content-Length:" ++ integer_to_list(Length),$\r,$\n,
			"If-match:" ++ Etag,$\r,$\n,
			$\r,$\n,
			Body],
	ok = ssl:send(SslSock, Request),
	F2 = fun F2(_Sock, {error, timeout}, Acc) ->
					lists:reverse(Acc);
			F2(Sock, {ok, Bin}, Acc) ->
					F2(Sock, ssl:recv(Sock, 0, Timeout), [Bin | Acc])
	end,
	RecvBuf = F2(SslSock, ssl:recv(SslSock, 0, Timeout), []),
	PatchResponse = list_to_binary(RecvBuf),
	[Headers, ResponseBody] = binary:split(PatchResponse, <<$\r,$\n,$\r,$\n>>),
	{struct, PatchObj} = mochijson:decode(ResponseBody),
	{_, {array, PatchChars}} = lists:keyfind("serviceCharacteristic", 1, PatchObj),
	F3 = fun({struct, [{"name","serviceIdentity"},{"value", ServiceId1}]})
						when ServiceId1 == ServiceId ->
					true;
			({struct,[{"name","servicePassword"},{"value", Password1}]})
						when Password1 == NewPassword ->
					true;
			({struct,[{"name","multiSession"},{"value", false}]}) ->
				true;
			(_) ->
				false
	end,
	true = lists:all(F3, PatchChars),
	<<"HTTP/1.1 200", _/binary>> = Headers,
	ok = ssl_socket_close(SslSock).

get_usagespecs() ->
	[{userdata, [{doc,"Get usageSpecification collection"}]}].

get_usagespecs(Config) ->
	HostUrl = ?config(host_url, Config),
	AcceptValue = "application/json",
	Accept = {"accept", AcceptValue},
	Request = {HostUrl ++ "/usageManagement/v1/usageSpecification", [Accept, auth_header()]},
	{ok, Result} = httpc:request(get, Request, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers, Body} = Result,
	{_, AcceptValue} = lists:keyfind("content-type", 1, Headers),
	ContentLength = integer_to_list(length(Body)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{array, [{struct, UsageSpec} | _]} = mochijson:decode(Body),
	{_, _} = lists:keyfind("id", 1, UsageSpec),
	{_, _} = lists:keyfind("href", 1, UsageSpec),
	{_, _} = lists:keyfind("name", 1, UsageSpec),
	{_, _} = lists:keyfind("validFor", 1, UsageSpec),
	{_, _} = lists:keyfind("usageSpecCharacteristic", 1, UsageSpec).

get_usagespecs_query() ->
	[{userdata, [{doc,"Get usageSpecification collection with query"}]}].

get_usagespecs_query(Config) ->
	HostUrl = ?config(host_url, Config),
	AcceptValue = "application/json",
	Accept = {"accept", AcceptValue},
	Path = HostUrl ++ "/usageManagement/v1/usageSpecification",
	Request1 = {Path, [Accept, auth_header()]},
	{ok, Result1} = httpc:request(get, Request1, [], []),
	{{"HTTP/1.1", 200, _OK}, _Headers1, Body1} = Result1,
	{array, UsageSpecs} = mochijson:decode(Body1),
	F1 = fun({struct, UsageSpec1}) ->
				{_, Type1} = lists:keyfind("name", 1, UsageSpec1),
				Type1
	end,
	Types = lists:map(F1, UsageSpecs),
	F2 = fun(Type2) ->
				Request2 = {Path ++ "?name=" ++ Type2, [Accept, auth_header()]},
				{ok, Result2} = httpc:request(get, Request2, [], []),
				{{"HTTP/1.1", 200, _OK}, Headers2, Body2} = Result2,
				{_, AcceptValue} = lists:keyfind("content-type", 1, Headers2),
				ContentLength2 = integer_to_list(length(Body2)),
				{_, ContentLength2} = lists:keyfind("content-length", 1, Headers2),
				{array, [{struct, UsageSpec2}]} = mochijson:decode(Body2),
				{_, _} = lists:keyfind("id", 1, UsageSpec2),
				{_, _} = lists:keyfind("href", 1, UsageSpec2),
				{_, Type2} = lists:keyfind("name", 1, UsageSpec2),
				{_, _} = lists:keyfind("validFor", 1, UsageSpec2),
				{_, _} = lists:keyfind("usageSpecCharacteristic", 1, UsageSpec2)
	end,
	lists:foreach(F2, Types).

get_usagespec() ->
	[{userdata, [{doc,"Get a TMF635 usage specification"}]}].

get_usagespec(Config) ->
	HostUrl = ?config(host_url, Config),
	AcceptValue = "application/json",
	Accept = {"accept", AcceptValue},
	Request1 = {HostUrl ++ "/usageManagement/v1/usageSpecification", [Accept, auth_header()]},
	{ok, Result1} = httpc:request(get, Request1, [], []),
	{{"HTTP/1.1", 200, _OK}, _Headers1, Body1} = Result1,
	{array, UsageSpecs} = mochijson:decode(Body1),
	F1 = fun({struct, UsageSpec1}) ->
				{_, Id} = lists:keyfind("id", 1, UsageSpec1),
				Href = "/usageManagement/v1/usageSpecification/" ++ Id,
				{_, Href} = lists:keyfind("href", 1, UsageSpec1),
				Href
	end,
	Uris = lists:map(F1, UsageSpecs),
	F2 = fun(Uri) ->
				Request2 = {HostUrl ++ Uri, [Accept, auth_header()]},
				{ok, Result2} = httpc:request(get, Request2, [], []),
				{{"HTTP/1.1", 200, _OK}, Headers2, Body2} = Result2,
				{_, AcceptValue} = lists:keyfind("content-type", 1, Headers2),
				ContentLength2 = integer_to_list(length(Body2)),
				{_, ContentLength2} = lists:keyfind("content-length", 1, Headers2),
				{struct, UsageSpec2} = mochijson:decode(Body2),
				{_, _} = lists:keyfind("id", 1, UsageSpec2),
				{_, _} = lists:keyfind("href", 1, UsageSpec2),
				{_, _} = lists:keyfind("name", 1, UsageSpec2),
				{_, _} = lists:keyfind("validFor", 1, UsageSpec2),
				{_, _} = lists:keyfind("usageSpecCharacteristic", 1, UsageSpec2)
	end,
	lists:foreach(F2, Uris).

get_auth_usage() ->
	[{userdata, [{doc,"Get a TMF635 auth usage"}]}].

get_auth_usage(Config) ->
	ClientAddress = {192, 168, 159, 158},
	ReqAttrs = [{?ServiceType, 2}, {?NasPortId, "wlan1"}, {?NasPortType, 19},
			{?UserName, "DE:AD:BE:EF:CA:FE"}, {?AcctSessionId, "8250020b"},
			{?CallingStationId, "FE-ED-BE-EF-FE-FE"},
			{?CalledStationId, "CA-FE-CA-FE-CA-FE:AP 1"},
			{?NasIdentifier, "ap-1.sigscale.net"},
			{?NasIpAddress, ClientAddress}, {?NasPort, 21}],
	ResAttrs = [{?SessionTimeout, 3600}, {?IdleTimeout, 300},
			{?AcctInterimInterval, 300},
			{?AscendDataRate, 4000000}, {?AscendXmitRate, 64000},
			{?ServiceType, 2}, {?FramedIpAddress, {10,2,56,78}},
			{?FramedIpNetmask, {255,255,0,0}}, {?FramedPool, "nat"},
			{?FramedRouting, 2}, {?FilterId, "firewall-1"},
			{?FramedMtu, 1492}, {?FramedRoute, "192.168.100.0/24 10.2.1.1 1"},
			{?Class, "silver"}, {?TerminationAction, 1}, {?PortLimit, 1}],
	ok = ocs_log:auth_log(radius, {{0,0,0,0}, 1812},
			{ClientAddress, 4598}, accept, ReqAttrs, ResAttrs),
	HostUrl = ?config(host_url, Config),
	AcceptValue = "application/json",
	Accept = {"accept", AcceptValue},
	RequestUri = HostUrl ++ "/usageManagement/v1/usage?type=AAAAccessUsage&sort=-date",
	Request = {RequestUri, [Accept, auth_header()]},
	{ok, Result} = httpc:request(get, Request, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers, Body} = Result,
	{_, AcceptValue} = lists:keyfind("content-type", 1, Headers),
	ContentLength = integer_to_list(length(Body)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{array, Usages} = mochijson:decode(Body),
	{struct, Usage} = lists:last(Usages),
	{_, _} = lists:keyfind("id", 1, Usage),
	{_, _} = lists:keyfind("href", 1, Usage),
	{_, _} = lists:keyfind("date", 1, Usage),
	{_, "AAAAccessUsage"} = lists:keyfind("type", 1, Usage),
	{_, "received"} = lists:keyfind("status", 1, Usage),
	{_, {struct, UsageSpecification}} = lists:keyfind("usageSpecification", 1, Usage),
	{_, _} = lists:keyfind("id", 1, UsageSpecification),
	{_, _} = lists:keyfind("href", 1, UsageSpecification),
	{_, "AAAAccessUsageSpec"} = lists:keyfind("name", 1, UsageSpecification),
	{_, {array, UsageCharacteristic}} = lists:keyfind("usageCharacteristic", 1, Usage),
	F = fun({struct, [{"name", "protocol"}, {"value", Protocol}]})
					when Protocol == "RADIUS"; Protocol == "DIAMETER" ->
				true;
			({struct, [{"name", "node"}, {"value", Node}]}) when is_list(Node) ->
				true;
			({struct, [{"name", "serverAddress"}, {"value", Address}]}) when is_list(Address) ->
				true;
			({struct, [{"name", "serverPort"}, {"value", Port}]}) when is_integer(Port) ->
				true;
			({struct, [{"name", "clientAddress"}, {"value", Address}]}) when is_list(Address) ->
				true;
			({struct, [{"name", "clientPort"}, {"value", Port}]}) when is_integer(Port) ->
				true;
			({struct, [{"name", "type"}, {"value", Type}]})
					when Type == "accept"; Type == "reject"; Type == "change" ->
				true;
			({struct, [{"name", "username"}, {"value", Username}]}) when is_list(Username) ->
				true;
			({struct, [{"name", "nasIpAddress"}, {"value", NasIpAddress}]}) when is_list(NasIpAddress) ->
				true;
			({struct, [{"name", "nasPort"}, {"value", Port}]}) when is_integer(Port) ->
				true;
			({struct, [{"name", "serviceType"}, {"value", Type}]}) when is_list(Type) ->
				true;
			({struct, [{"name", "framedIpAddress"}, {"value", Address}]}) when is_list(Address) ->
				true;
			({struct, [{"name", "framedPool"}, {"value", Pool}]}) when is_list(Pool) ->
				true;
			({struct, [{"name", "framedIpNetmask"}, {"value", Netmask}]}) when is_list(Netmask) ->
				true;
			({struct, [{"name", "framedRouting"}, {"value", Routing}]}) when is_list(Routing) ->
				true;
			({struct, [{"name", "filterId"}, {"value", Id}]}) when is_list(Id) ->
				true;
			({struct, [{"name", "framedMtu"}, {"value", Mtu}]}) when is_integer(Mtu) ->
				true;
			({struct, [{"name", "framedRoute"}, {"value", Route}]}) when is_list(Route) ->
				true;
			({struct, [{"name", "class"}, {"value", Class}]}) when is_list(Class) ->
				true;
			({struct, [{"name", "sessionTimeout"}, {"value", Timeout}]}) when is_integer(Timeout) ->
				true;
			({struct, [{"name", "idleTimeout"}, {"value", Timeout}]}) when is_integer(Timeout) ->
				true;
			({struct, [{"name", "terminationAction"}, {"value", Action}]}) when is_list(Action) ->
				true;
			({struct, [{"name", "calledStationId"}, {"value", Id}]}) when is_list(Id) ->
				true;
			({struct, [{"name", "callingStationId"}, {"value", Id}]}) when is_list(Id) ->
				true;
			({struct, [{"name", "nasIdentifier"}, {"value", Id}]}) when is_list(Id) ->
				true;
			({struct, [{"name", "nasPortId"}, {"value", Id}]}) when is_list(Id) ->
				true;
			({struct, [{"name", "nasPortType"}, {"value", Type}]}) when is_list(Type) ->
				true;
			({struct, [{"name", "portLimit"}, {"value", Limit}]}) when is_integer(Limit) ->
				true;
			({struct, [{"name", "ascendDataRate"}, {"value", Rate}]}) when is_integer(Rate) ->
				true;
			({struct, [{"name", "ascendXmitRate"}, {"value", Rate}]}) when is_integer(Rate) ->
				true;
			({struct, [{"name", "acctInterimInterval"}, {"value", Interval}]}) when is_integer(Interval) ->
				true
	end,
	true = lists:any(F, UsageCharacteristic).

get_auth_usage_id() ->
	[{userdata, [{doc,"Get a single TMF635 auth usage"}]}].

get_auth_usage_id(Config) ->
	ReqAttrs = [{?UserName, "ED:DA:EB:FE:AC:EF"},
			{?CallingStationId, "ED:DA:EB:FE:AC:EF"},
			{?CalledStationId, "CA-FE-CA-FE-CA-FE:AP 1"},
			{?NasIdentifier, "ap-1.sigscale.net"}],
	ResAttrs = [{?SessionTimeout, 3600}],
	ok = ocs_log:auth_log(radius, {{0,0,0,0}, 1812},
			{{192,168,178,167}, 4599}, accept, ReqAttrs, ResAttrs),
	HostUrl = ?config(host_url, Config),
	AcceptValue = "application/json",
	Accept = {"accept", AcceptValue},
	RequestUri1 = HostUrl ++ "/usageManagement/v1/usage?type=AAAAccessUsage",
	Request1 = {RequestUri1, [Accept, auth_header()]},
	{ok, Result1} = httpc:request(get, Request1, [], []),
	{{"HTTP/1.1", 200, _OK}, _Headers1, Body1} = Result1,
	{array, Usages} = mochijson:decode(Body1),
	{struct, Usage} = lists:last(Usages),
	{_, Id} = lists:keyfind("id", 1, Usage),
	{_, Href} = lists:keyfind("href", 1, Usage),
	RequestUri2 = HostUrl ++ Href,
	Request2 = {RequestUri2, [Accept, auth_header()]},
	{ok, Result2} = httpc:request(get, Request2, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers2, Body2} = Result2,
	{_, AcceptValue} = lists:keyfind("content-type", 1, Headers2),
	ContentLength = integer_to_list(length(Body2)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers2),
	{struct, Usage} = mochijson:decode(Body2),
	{_, Id} = lists:keyfind("id", 1, Usage),
	{_, Href} = lists:keyfind("href", 1, Usage).

get_auth_usage_filter() ->
	[{userdata, [{doc,"Get filtered TMF635 auth usage"}]}].

get_auth_usage_filter(Config) ->
	ClientAddress = {192, 168, 199, 198},
	ReqAttrs = [{?ServiceType, 2}, {?NasPortId, "wlan1"}, {?NasPortType, 19},
			{?UserName, "DE:AD:BE:EF:CA:FE"}, {?AcctSessionId, "82510ed5"},
			{?CallingStationId, "FE-EA-EE-EF-FA-FA"},
			{?CalledStationId, "CA-FE-CA-FE-CA-FE:AP 1"},
			{?NasIdentifier, "ap-1.sigscale.net"},
			{?NasIpAddress, ClientAddress}, {?NasPort, 1}],
	ResAttrs = [{?SessionTimeout, 3600}, {?IdleTimeout, 300},
			{?AcctInterimInterval, 300},
			{?AscendDataRate, 4000000}, {?AscendXmitRate, 64000},
			{?ServiceType, 2}, {?FramedIpAddress, {10,2,74,45}},
			{?FramedIpNetmask, {255,255,0,0}}, {?FramedPool, "nat"},
			{?FramedRouting, 2}, {?FilterId, "firewall-1"},
			{?FramedMtu, 1492}, {?FramedRoute, "192.168.100.0/24 10.2.1.1 1"},
			{?Class, "silver"}, {?TerminationAction, 1}, {?PortLimit, 1}],
	ok = ocs_log:auth_log(radius, {{0,0,0,0}, 1812},
			{ClientAddress, 4589}, accept, ReqAttrs, ResAttrs),
	HostUrl = ?config(host_url, Config),
	AcceptValue = "application/json",
	Accept = {"accept", AcceptValue},
	RequestUri = HostUrl ++ "/usageManagement/v1/usage?type=AAAAccessUsage&sort=-date&fields=date,status,usageCharacteristic",
	Request = {RequestUri, [Accept, auth_header()]},
	{ok, Result} = httpc:request(get, Request, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers, Body} = Result,
	{_, AcceptValue} = lists:keyfind("content-type", 1, Headers),
	ContentLength = integer_to_list(length(Body)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{array, Usages} = mochijson:decode(Body),
	{struct, Usage} = lists:last(Usages),
	{_, _, Usage1} = lists:keytake("id", 1, Usage),
	{_, _, Usage2} = lists:keytake("href", 1, Usage1),
	{_, _, Usage3} = lists:keytake("date", 1, Usage2),
	{_, _, Usage4} = lists:keytake("status", 1, Usage3),
	{_, {_, {array, _UsageCharacteristic}}, []} = lists:keytake("usageCharacteristic", 1, Usage4).

get_auth_usage_range() ->
	[{userdata, [{doc,"Get range of items in the usage collection"}]}].

get_auth_usage_range(Config) ->
	{ok, PageSize} = application:get_env(ocs, rest_page_size),
	Flog = fun(_F, 0) ->
				ok;
			(F, N) ->
				ClientAddress = ocs_test_lib:ipv4(),
				ClientPort = ocs_test_lib:port(),
				ReqAttrs = [{?ServiceType, 2}, {?NasPortId, "wlan1"}, {?NasPortType, 19},
						{?UserName, ocs:generate_identity()},
						{?CallingStationId, ocs_test_lib:mac()},
						{?CalledStationId, ocs_test_lib:mac()},
						{?NasIpAddress, ClientAddress}, {?NasPort, ClientPort}],
				ResAttrs = [{?SessionTimeout, 3600}, {?IdleTimeout, 300}],
				ok = ocs_log:auth_log(radius, {{0,0,0,0}, 1812},
						{ClientAddress, ClientPort}, accept, ReqAttrs, ResAttrs),
				F(F, N - 1)
	end,
	NumLogged = (PageSize * 2) + (PageSize div 2) + 17,
	ok = Flog(Flog, NumLogged),
	RangeSize = case PageSize > 100 of
		true ->
			rand:uniform(PageSize - 10) + 10;
		false ->
			PageSize - 1
	end,
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	RequestHeaders1 = [Accept, auth_header()],
	Request1 = {HostUrl ++ "/usageManagement/v1/usage?type=AAAAccessUsage", RequestHeaders1},
	{ok, Result1} = httpc:request(get, Request1, [], []),
	{{"HTTP/1.1", 200, _OK}, ResponseHeaders1, Body1} = Result1,
	{_, Etag} = lists:keyfind("etag", 1, ResponseHeaders1),
	true = is_etag_valid(Etag),
	{_, AcceptRanges1} = lists:keyfind("accept-ranges", 1, ResponseHeaders1),
	true = lists:member("items", string:tokens(AcceptRanges1, ", ")),
	{_, Range1} = lists:keyfind("content-range", 1, ResponseHeaders1),
	["items", "1", RangeEndS1, "*"] = string:tokens(Range1, " -/"),
	RequestHeaders2 = RequestHeaders1 ++ [{"if-match", Etag}],
	PageSize = list_to_integer(RangeEndS1),
	{array, Usages1} = mochijson:decode(Body1),
	PageSize = length(Usages1),
	Fget = fun(F, RangeStart2, RangeEnd2) ->
				RangeHeader = [{"range",
						"items " ++ integer_to_list(RangeStart2)
						++ "-" ++ integer_to_list(RangeEnd2)}],
				RequestHeaders3 = RequestHeaders2 ++ RangeHeader,
				Request2 = {HostUrl ++ "/usageManagement/v1/usage?type=AAAAccessUsage", RequestHeaders3},
				{ok, Result2} = httpc:request(get, Request2, [], []),
				{{"HTTP/1.1", 200, _OK}, ResponseHeaders2, Body2} = Result2,
				{_, Etag} = lists:keyfind("etag", 1, ResponseHeaders2),
				{_, AcceptRanges2} = lists:keyfind("accept-ranges", 1, ResponseHeaders2),
				true = lists:member("items", string:tokens(AcceptRanges2, ", ")),
				{_, Range} = lists:keyfind("content-range", 1, ResponseHeaders2),
				["items", RangeStartS, RangeEndS, EndS] = string:tokens(Range, " -/"),
				RangeStart2 = list_to_integer(RangeStartS),
				case EndS of
					"*" ->
						RangeEnd2 = list_to_integer(RangeEndS),
						RangeSize = (RangeEnd2 - (RangeStart2 - 1)),
						{array, Usages2} = mochijson:decode(Body2),
						RangeSize = length(Usages2),
						NewRangeStart = RangeEnd2 + 1,
						NewRangeEnd = NewRangeStart + (RangeSize - 1),
						F(F, NewRangeStart, NewRangeEnd);
					EndS when RangeEndS == EndS ->
						list_to_integer(EndS)
				end
	end,
	End = Fget(Fget, PageSize + 1, PageSize + RangeSize),
	End >= NumLogged.

get_acct_usage() ->
	[{userdata, [{doc,"Get a TMF635 acct usage"}]}].

get_acct_usage(Config) ->
	ClientAddress = {192, 168, 159, 158},
	Attrs = [{?UserName, "DE:AD:BE:EF:CA:FE"}, {?AcctSessionId, "825df837"},
			{?ServiceType, 2}, {?NasPortId, "wlan1"}, {?NasPortType, 19},
			{?CallingStationId, "FE-ED-BE-EF-FE-FE"},
			{?CalledStationId, "CA-FE-CA-FE-CA-FE:AP 1"},
			{?NasIdentifier, "ap-1.sigscale.net"},
			{?NasIpAddress, ClientAddress}, {?NasPort, 21},
			{?SessionTimeout, 3600}, {?IdleTimeout, 300},
			{?FramedIpAddress, {10,2,56,78}},
			{?FramedIpNetmask, {255,255,0,0}}, {?FramedPool, "nat"},
			{?FramedRouting, 2}, {?FilterId, "firewall-1"},
			{?FramedMtu, 1492}, {?FramedRoute, "192.168.100.0/24 10.2.1.1 1"},
			{?Class, "silver"}, {?PortLimit, 1},
			{?AcctDelayTime, 5}, {?EventTimestamp, erlang:system_time(?SECOND)},
			{?AcctMultiSessionId, "8250731f"}, {?AcctLinkCount, 2},
			{?AcctAuthentic, 1}, {?AcctSessionTime, 3021},
			{?AcctInputOctets, 1702487}, {?AcctOutputOctets, 301629083},
			{?AcctInputGigawords, 1}, {?AcctOutputGigawords, 2},
			{?AcctInputPackets, 3021}, {?AcctOutputPackets, 125026},
			{?AcctTerminateCause, 5}],
	ok = ocs_log:acct_log(radius, {{0,0,0,0}, 1813}, stop, Attrs, undefined, undefined),
	HostUrl = ?config(host_url, Config),
	AcceptValue = "application/json",
	Accept = {"accept", AcceptValue},
	RequestUri = HostUrl ++ "/usageManagement/v1/usage?type=AAAAccountingUsage&sort=-date",
	Request = {RequestUri, [Accept, auth_header()]},
	{ok, Result} = httpc:request(get, Request, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers, Body} = Result,
	{_, AcceptValue} = lists:keyfind("content-type", 1, Headers),
	ContentLength = integer_to_list(length(Body)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{array, Usages} = mochijson:decode(Body),
	{struct, Usage} = lists:last(Usages),
	{_, _} = lists:keyfind("id", 1, Usage),
	{_, _} = lists:keyfind("href", 1, Usage),
	{_, _} = lists:keyfind("date", 1, Usage),
	{_, "AAAAccountingUsage"} = lists:keyfind("type", 1, Usage),
	{_, "received"} = lists:keyfind("status", 1, Usage),
	{_, {struct, UsageSpecification}} = lists:keyfind("usageSpecification", 1, Usage),
	{_, _} = lists:keyfind("id", 1, UsageSpecification),
	{_, _} = lists:keyfind("href", 1, UsageSpecification),
	{_, "AAAAccountingUsageSpec"} = lists:keyfind("name", 1, UsageSpecification),
	{_, {array, UsageCharacteristic}} = lists:keyfind("usageCharacteristic", 1, Usage),
	F = fun({struct, [{"name", "protocol"}, {"value", Protocol}]})
					when Protocol == "RADIUS"; Protocol == "DIAMETER" ->
				true;
			({struct, [{"name", "node"}, {"value", Node}]}) when is_list(Node) ->
				true;
			({struct, [{"name", "serverAddress"}, {"value", Address}]}) when is_list(Address) ->
				true;
			({struct, [{"name", "serverPort"}, {"value", Port}]}) when is_integer(Port) ->
				true;
			({struct, [{"name", "type"}, {"value", Type}]}) when Type == "start";
					Type == "stop"; Type == "on"; Type == "off"; Type == "interim" ->
				true;
			({struct, [{"name", "username"}, {"value", Username}]}) when is_list(Username) ->
				true;
			({struct, [{"name", "nasIpAddress"}, {"value", NasIpAddress}]}) when is_list(NasIpAddress) ->
				true;
			({struct, [{"name", "nasPort"}, {"value", Port}]}) when is_integer(Port) ->
				true;
			({struct, [{"name", "serviceType"}, {"value", Type}]}) when is_list(Type) ->
				true;
			({struct, [{"name", "framedIpAddress"}, {"value", Address}]}) when is_list(Address) ->
				true;
			({struct, [{"name", "framedPool"}, {"value", Pool}]}) when is_list(Pool) ->
				true;
			({struct, [{"name", "framedIpNetmask"}, {"value", Netmask}]}) when is_list(Netmask) ->
				true;
			({struct, [{"name", "framedRouting"}, {"value", Routing}]}) when is_list(Routing) ->
				true;
			({struct, [{"name", "filterId"}, {"value", Id}]}) when is_list(Id) ->
				true;
			({struct, [{"name", "framedMtu"}, {"value", Mtu}]}) when is_integer(Mtu) ->
				true;
			({struct, [{"name", "framedRoute"}, {"value", Route}]}) when is_list(Route) ->
				true;
			({struct, [{"name", "class"}, {"value", Class}]}) when is_list(Class) ->
				true;
			({struct, [{"name", "sessionTimeout"}, {"value", Timeout}]}) when is_integer(Timeout) ->
				true;
			({struct, [{"name", "idleTimeout"}, {"value", Timeout}]}) when is_integer(Timeout) ->
				true;
			({struct, [{"name", "calledStationId"}, {"value", Id}]}) when is_list(Id) ->
				true;
			({struct, [{"name", "callingStationId"}, {"value", Id}]}) when is_list(Id) ->
				true;
			({struct, [{"name", "nasIdentifier"}, {"value", Id}]}) when is_list(Id) ->
				true;
			({struct, [{"name", "nasPortId"}, {"value", Id}]}) when is_list(Id) ->
				true;
			({struct, [{"name", "nasPortType"}, {"value", Type}]}) when is_list(Type) ->
				true;
			({struct, [{"name", "portLimit"}, {"value", Limit}]}) when is_integer(Limit) ->
				true;
			({struct, [{"name", "acctDelayTime"}, {"value", Time}]}) when is_integer(Time) ->
				true;
			({struct, [{"name", "eventTimestamp"}, {"value", DateTime}]}) when is_list(DateTime) ->
				true;
			({struct, [{"name", "acctSessionId"}, {"value", Id}]}) when is_list(Id) ->
				true;
			({struct, [{"name", "acctMultiSessionId"}, {"value", Id}]}) when is_list(Id) ->
				true;
			({struct, [{"name", "acctLinkCount"}, {"value", Count}]}) when is_integer(Count) ->
				true;
			({struct, [{"name", "acctAuthentic"}, {"value", Type}]}) when is_list(Type) ->
				true;
			({struct, [{"name", "acctSessionTime"}, {"value", Time}]}) when is_integer(Time) ->
				true;
			({struct, [{"name", "inputOctets"}, {"value", Octets}]}) when is_integer(Octets) ->
				true;
			({struct, [{"name", "outputOctets"}, {"value", Octets}]}) when is_integer(Octets) ->
				true;
			({struct, [{"name", "acctInputGigawords"}, {"value", Words}]}) when is_integer(Words) ->
				true;
			({struct, [{"name", "acctOutputGigawords"}, {"value", Words}]}) when is_integer(Words) ->
				true;
			({struct, [{"name", "acctInputPackets"}, {"value", Packets}]}) when is_integer(Packets) ->
				true;
			({struct, [{"name", "acctOutputPackets"}, {"value", Packets}]}) when is_integer(Packets) ->
				true;
			({struct, [{"name", "acctTerminateCause"}, {"value", Cause}]}) when is_list(Cause) ->
				true
	end,
	true = lists:all(F, UsageCharacteristic).

get_acct_usage_id() ->
	[{userdata, [{doc,"Get a single TMF635 acct usage"}]}].

get_acct_usage_id(Config) ->
	Attrs = [{?UserName, "ED:DA:EB:FE:AC:EF"},
			{?CallingStationId, "ED:DA:EB:FE:AC:EF"},
			{?CalledStationId, "CA-FE-CA-FE-CA-FE:AP 1"},
			{?NasIdentifier, "ap-1.sigscale.net"},
			{?AcctSessionTime, 3600}, {?AcctInputOctets, 756012},
			{?AcctOutputOctets, 312658643}, {?AcctTerminateCause, 5}], 
	ok = ocs_log:acct_log(radius, {{0,0,0,0}, 1812}, stop, Attrs, undefined, undefined),
	HostUrl = ?config(host_url, Config),
	AcceptValue = "application/json",
	Accept = {"accept", AcceptValue},
	RequestUri1 = HostUrl ++ "/usageManagement/v1/usage?type=AAAAccountingUsage",
	Request1 = {RequestUri1, [Accept, auth_header()]},
	{ok, Result1} = httpc:request(get, Request1, [], []),
	{{"HTTP/1.1", 200, _OK}, _Headers1, Body1} = Result1,
	{array, Usages} = mochijson:decode(Body1),
	{struct, Usage} = lists:last(Usages),
	{_, Href} = lists:keyfind("href", 1, Usage),
	RequestUri2 = HostUrl ++ Href,
	Request2 = {RequestUri2, [Accept, auth_header()]},
	{ok, Result2} = httpc:request(get, Request2, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers2, Body2} = Result2,
	{_, AcceptValue} = lists:keyfind("content-type", 1, Headers2),
	ContentLength = integer_to_list(length(Body2)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers2),
	{struct, Usage} = mochijson:decode(Body2),
	{_, _Id} = lists:keyfind("id", 1, Usage),
	{_, Href} = lists:keyfind("href", 1, Usage).

get_acct_usage_filter() ->
	[{userdata, [{doc,"Get filtered TMF635 acct usage"}]}].

get_acct_usage_filter(Config) ->
	Attrs = [{?UserName, "ED:DD:B8:F6:4C:8A"},
			{?CallingStationId, "ED:DA:EB:98:84:A2"},
			{?CalledStationId, "CA-FE-CA-FE-CA-FE:AP 1"},
			{?NasIdentifier, "ap-1.sigscale.net"},
			{?AcctSessionTime, 3600}, {?AcctInputOctets, 890123},
			{?AcctOutputOctets, 482634213}, {?AcctTerminateCause, 5}], 
	ok = ocs_log:acct_log(radius, {{0,0,0,0}, 1812}, stop, Attrs, undefined, undefined),
	HostUrl = ?config(host_url, Config),
	AcceptValue = "application/json",
	Accept = {"accept", AcceptValue},
	RequestUri = HostUrl ++ "/usageManagement/v1/usage?type=AAAAccountingUsage&sort=-date&fields=date,status,usageCharacteristic",
	Request = {RequestUri, [Accept, auth_header()]},
	{ok, Result} = httpc:request(get, Request, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers, Body} = Result,
	{_, AcceptValue} = lists:keyfind("content-type", 1, Headers),
	ContentLength = integer_to_list(length(Body)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{array, Usages} = mochijson:decode(Body),
	{struct, Usage} = lists:last(Usages),
	{_, _, Usage1} = lists:keytake("id", 1, Usage),
	{_, _, Usage2} = lists:keytake("href", 1, Usage1),
	{_, _, Usage3} = lists:keytake("date", 1, Usage2),
	{_, _, Usage4} = lists:keytake("status", 1, Usage3),
	{_, {_, {array, _UsageCharacteristic}}, []} = lists:keytake("usageCharacteristic", 1, Usage4).

get_acct_usage_range() ->
	[{userdata, [{doc,"Get range of items in the usage collection"}]}].

get_acct_usage_range(Config) ->
	{ok, PageSize} = application:get_env(ocs, rest_page_size),
	Flog = fun(_F, 0) ->
				ok;
			(F, N) ->
				ClientAddress = ocs_test_lib:ipv4(),
				ClientPort = ocs_test_lib:port(),
				Attrs = [{?UserName, ocs:generate_identity()},
						{?CallingStationId, ocs_test_lib:mac()},
						{?CalledStationId, ocs_test_lib:mac()},
						{?NasIpAddress, ClientAddress},
						{?NasPort, ClientPort},
						{?AcctSessionTime, 3600},
						{?AcctInputOctets, rand:uniform(100000000)},
						{?AcctOutputOctets, rand:uniform(10000000000)},
						{?AcctTerminateCause, 5}], 
				ok = ocs_log:acct_log(radius, {{0,0,0,0}, 1812}, stop, Attrs, undefined, undefined),
				F(F, N - 1)
	end,
	NumLogged = (PageSize * 2) + (PageSize div 2) + 17,
	ok = Flog(Flog, NumLogged),
	RangeSize = case PageSize > 100 of
		true ->
			rand:uniform(PageSize - 10) + 10;
		false ->
			PageSize - 1
	end,
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	RequestHeaders1 = [Accept, auth_header()],
	Request1 = {HostUrl ++ "/usageManagement/v1/usage?type=AAAAccountingUsage", RequestHeaders1},
	{ok, Result1} = httpc:request(get, Request1, [], []),
	{{"HTTP/1.1", 200, _OK}, ResponseHeaders1, Body1} = Result1,
	{_, Etag} = lists:keyfind("etag", 1, ResponseHeaders1),
	true = is_etag_valid(Etag),
	{_, AcceptRanges1} = lists:keyfind("accept-ranges", 1, ResponseHeaders1),
	true = lists:member("items", string:tokens(AcceptRanges1, ", ")),
	{_, Range1} = lists:keyfind("content-range", 1, ResponseHeaders1),
	["items", "1", RangeEndS1, "*"] = string:tokens(Range1, " -/"),
	RequestHeaders2 = RequestHeaders1 ++ [{"if-match", Etag}],
	PageSize = list_to_integer(RangeEndS1),
	{array, Usages1} = mochijson:decode(Body1),
	PageSize = length(Usages1),
	Fget = fun(F, RangeStart2, RangeEnd2) ->
				RangeHeader = [{"range",
						"items " ++ integer_to_list(RangeStart2)
						++ "-" ++ integer_to_list(RangeEnd2)}],
				RequestHeaders3 = RequestHeaders2 ++ RangeHeader,
				Request2 = {HostUrl ++ "/usageManagement/v1/usage?type=AAAAccountingUsage", RequestHeaders3},
				{ok, Result2} = httpc:request(get, Request2, [], []),
				{{"HTTP/1.1", 200, _OK}, ResponseHeaders2, Body2} = Result2,
				{_, Etag} = lists:keyfind("etag", 1, ResponseHeaders2),
				{_, AcceptRanges2} = lists:keyfind("accept-ranges", 1, ResponseHeaders2),
				true = lists:member("items", string:tokens(AcceptRanges2, ", ")),
				{_, Range} = lists:keyfind("content-range", 1, ResponseHeaders2),
				["items", RangeStartS, RangeEndS, EndS] = string:tokens(Range, " -/"),
				RangeStart2 = list_to_integer(RangeStartS),
				case EndS of
					"*" ->
						RangeEnd2 = list_to_integer(RangeEndS),
						RangeSize = (RangeEnd2 - (RangeStart2 - 1)),
						{array, Usages2} = mochijson:decode(Body2),
						RangeSize = length(Usages2),
						NewRangeStart = RangeEnd2 + 1,
						NewRangeEnd = NewRangeStart + (RangeSize - 1),
						F(F, NewRangeStart, NewRangeEnd);
					EndS when RangeEndS == EndS ->
						list_to_integer(EndS)
				end
	end,
	End = Fget(Fget, PageSize + 1, PageSize + RangeSize),
	End >= NumLogged.

get_ipdr_usage() ->
	[{userdata, [{doc,"Get a TMF635 IPDR usage"}]}].

get_ipdr_usage(Config) ->
	HostUrl = ?config(host_url, Config),
	AcceptValue = "application/json",
	Accept = {"accept", AcceptValue},
	RequestUri = HostUrl ++ "/usageManagement/v1/usage?type=PublicWLANAccessUsage",
	Request = {RequestUri, [Accept, auth_header()]},
	{ok, Result} = httpc:request(get, Request, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers, Body} = Result,
	{_, AcceptValue} = lists:keyfind("content-type", 1, Headers),
	ContentLength = integer_to_list(length(Body)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{_, {array, [{struct, Usage}]}} = mochijson:decode(Body),
	{_, _} = lists:keyfind("id", 1, Usage),
	{_, _} = lists:keyfind("href", 1, Usage),
	{_, _} = lists:keyfind("date", 1, Usage),
	{_, "PublicWLANAccessUsage"} = lists:keyfind("type", 1, Usage),
	{_, _} = lists:keyfind("description", 1, Usage),
	{_, "recieved"} = lists:keyfind("status", 1, Usage),
	{struct, UsageSpecification} = lists:keyfind("usageSpecification", 1, Usage),
	{_, _} = lists:keyfind("id", 1, UsageSpecification),
	{_, _} = lists:keyfind("href", 1, UsageSpecification),
	{_, "PublicWLANAccessUsageSpec"} = lists:keyfind("name", 1, UsageSpecification),
	{array, UsageCharacteristic} = lists:keyfind("usageCharacteristic", 1, Usage),
	F = fun({struct, [{"name", "userName"},{"value", UserName}]}) when is_list(UserName)->
				true;
			({struct, [{"name", "acctSessionId"},{"value", AcctSessionId}]}) when is_list(AcctSessionId) ->
				true;
			({struct, [{"name", "userIpAddress"},{"value", UserIpAddress}]}) when is_list(UserIpAddress) ->
				true;
			({struct, [{"name", "callingStationId"},{"value", CallingStationId}]}) when is_list(CallingStationId) ->
				true;
			({struct, [{"name", "calledStationId"},{"value", CalledStationId}]}) when is_list(CalledStationId) ->
				true;
			({struct, [{"name", "nasIpAddress"},{"value", NasIpAddress}]}) when is_list(NasIpAddress) ->
				true;
			({struct, [{"name", "nasId"},{"value", NasId}]}) when is_list(NasId) ->
				true;
			({struct, [{"name", "sessionDuration"},{"value", SessionDuration}]}) when is_integer(SessionDuration) ->
				true;
			({struct, [{"name", "inputOctets"},{"value", InputOctets}]}) when is_integer(InputOctets) ->
				true;
			({struct, [{"name", "outputOctets"},{"value", OutputOctets}]}) when is_integer(OutputOctets) ->
				true;
			({struct, [{"name", "sessionTerminateCause"},{"value", SessionTerminateCause}]}) when is_integer(SessionTerminateCause) ->
				true
	end,
	true = lists:all(F, UsageCharacteristic).

top_up() ->
	[{userdata, [{doc,"TMF654 Prepay Balance Management API :
			Top-up add a new bucket"}]}].

top_up(Config) ->
	P1 = price(usage, octets, rand:uniform(10000), rand:uniform(100)),
	OfferId = offer_add([P1], 4),
	ProdRef = product_add(OfferId),
	HostUrl = ?config(host_url, Config),
	AcceptValue = "application/json",
	Accept = {"accept", AcceptValue},
	ContentType = "application/json",
	RequestURI = HostUrl ++ "/balanceManagement/v1/product/" ++ ProdRef ++ "/balanceTopup",
	BucketType = {"type", ocs:generate_identity()},
	Channel = {"channel", {struct, [{"name", ocs:generate_identity()}]}},
	RechargeAmount = rand:uniform(10000000),
	Amount = {"amount", {struct, [{"units", octets}, {"amount", RechargeAmount}]}},
	Product = {"product", {struct, [{"id", ProdRef}]}},
	SDT = erlang:system_time(?MILLISECOND),
	EDT = erlang:system_time(?MILLISECOND) + rand:uniform(10000000000),
	ValidFor = {"validFor",
			{struct, [{"startDateTime", ocs_rest:iso8601(SDT)},
			{"endDateTime", ocs_rest:iso8601(EDT)}]}},
	JSON = {struct, [BucketType, Channel, Amount, Product, ValidFor]},
	RequestBody = lists:flatten(mochijson:encode(JSON)),
	Request = {RequestURI, [Accept, auth_header()], ContentType, RequestBody},
	{ok, Result} = httpc:request(post, Request, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, _} = Result,
	{_, Href} = lists:keyfind("location", 1, Headers),
	BucketId = lists:last(string:tokens(Href, "/")),
	{ok, #bucket{units = octets, remain_amount = RechargeAmount,
			start_date = SDT, end_date = EDT,
			product = [ProdRef]}} = ocs:find_bucket(BucketId).

get_balance() ->
	[{userdata, [{doc,"TMF654 Prepay Balance Management API :
			Get accumulated balance for given product instance"}]}].

get_balance(Config) ->
	HostUrl = ?config(host_url, Config),
	P1 = price(usage, octets, rand:uniform(10000), rand:uniform(100)),
	OfferId = offer_add([P1], 4),
	ProdRef = product_add(OfferId),
	B1 = b(cents, 10000),
	B2 = b(cents, 5),
	{_, _, #bucket{id = BId1}} = ocs:add_bucket(ProdRef, B1),
	{_, _, #bucket{id = BId2}} = ocs:add_bucket(ProdRef, B2),
	AcceptValue = "application/json",
	Accept = {"accept", AcceptValue},
	Balance = B1#bucket.remain_amount + B2#bucket.remain_amount,
	Path = "/balanceManagement/v1/product/" ++ ProdRef ++ "/accumulatedBalance",
	GETURI = HostUrl ++ Path,
	GETRequest = {GETURI, [Accept, auth_header()]},
	{ok, GETResult} = httpc:request(get, GETRequest, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers, Body} = GETResult,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers),
	ContentLength = integer_to_list(length(Body)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{struct, PrePayBalance} = mochijson:decode(Body),
	{_, {struct, TotalAmount}} = lists:keyfind("totalBalance", 1, PrePayBalance),
	{_, {array, [{struct, Product}]}} = lists:keyfind("product", 1, PrePayBalance),
	{_, {array, Buckets}} = lists:keyfind("buckets", 1, PrePayBalance),
	{_, ProdRef} = lists:keyfind("id", 1, Product),
	{_, Path} =
			lists:keyfind("href", 1, Product),
	F = fun({struct, B}) ->
		case lists:keyfind("id", 1, B) of
			{_, Id} when Id == BId1; Id == BId2 ->
				true;
			_ ->
				false
		end
	end,
	true = lists:all(F, Buckets),
	{_, Balance1} = lists:keyfind("amount", 1, TotalAmount),
	Balance1 = ocs_rest:millionths_out(Balance).

get_balance_service() ->
	[{userdata, [{doc,"TMF654 Prepay Balance Management API :
			Get accumulated balance for given service identifier"}]}].

get_balance_service(Config) ->
	HostUrl = ?config(host_url, Config),
	P1 = price(usage, octets, rand:uniform(10000), rand:uniform(100)),
	OfferId = offer_add([P1], 4),
	ProdRef = product_add(OfferId),
	B1 = b(cents, 10000),
	B2 = b(cents, 5),
	{_, _, #bucket{id = BId1}} = ocs:add_bucket(ProdRef, B1),
	{_, _, #bucket{id = BId2}} = ocs:add_bucket(ProdRef, B2),
	ServiceId = service_add(ProdRef),
	AcceptValue = "application/json",
	Accept = {"accept", AcceptValue},
	Balance = B1#bucket.remain_amount + B2#bucket.remain_amount,
	Path = "/balanceManagement/v1/service/" ++ ServiceId ++ "/accumulatedBalance",
	GETURI = HostUrl ++ Path,
	GETRequest = {GETURI, [Accept, auth_header()]},
	{ok, GETResult} = httpc:request(get, GETRequest, [], []),
	{{"HTTP/1.1", 200, _OK}, Headers, Body} = GETResult,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers),
	ContentLength = integer_to_list(length(Body)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{struct, PrePayBalance} = mochijson:decode(Body),
	{_, {struct, TotalAmount}} = lists:keyfind("totalBalance", 1, PrePayBalance),
	{_, {array, [{struct, Product}]}} = lists:keyfind("product", 1, PrePayBalance),
	{_, {array, Buckets}} = lists:keyfind("buckets", 1, PrePayBalance),
	{_, ProdRef} = lists:keyfind("id", 1, Product),
	{_, Path} =
			lists:keyfind("href", 1, Product),
	F = fun({struct, B}) ->
		case lists:keyfind("id", 1, B) of
			{_, Id} when Id == BId1; Id == BId2 ->
				true;
			_ ->
				false
		end
	end,
	true = lists:all(F, Buckets),
	{_, Balance1} = lists:keyfind("amount", 1, TotalAmount),
	Balance1 = ocs_rest:millionths_out(Balance).

simultaneous_updates_on_client_failure() ->
	[{userdata, [{doc,"Simulataneous HTTP PATCH requests on client resource must fail
			if the resource is already being updated by someone else"}]}].

simultaneous_updates_on_client_failure(Config) ->
	ContentType = "application/json",
	ID = "10.3.53.91",
	Port = 3699,
	Protocol = "RADIUS",
	Secret = "ksc8c244npqc",
	JSON = {struct, [{"id", ID}, {"port", Port}, {"protocol", Protocol},
		{"secret", Secret}]},
	RequestBody = lists:flatten(mochijson:encode(JSON)),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Request1 = {HostUrl ++ "/ocs/v1/client/", [Accept, auth_header()], ContentType, RequestBody},
	{ok, Result} = httpc:request(post, Request1, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, ResponseBody} = Result,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers),
	{_, _Etag} = lists:keyfind("etag", 1, Headers),
	ContentLength = integer_to_list(length(ResponseBody)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{_, URI} = lists:keyfind("location", 1, Headers),
	{"/ocs/v1/client/" ++ ID, _} = httpd_util:split_path(URI),
	{struct, Object} = mochijson:decode(ResponseBody),
	{_, ID} = lists:keyfind("id", 1, Object),
	{_, URI} = lists:keyfind("href", 1, Object),
	{_, Port} = lists:keyfind("port", 1, Object),
	{_, Protocol} = lists:keyfind("protocol", 1, Object),
	{_, Secret} = lists:keyfind("secret", 1, Object),
	RestPort = ?config(port, Config),
	{ok, SslSock} = ssl:connect({127,0,0,1}, RestPort,  [binary, {active, false}], infinity),
	NewSecret = ocs:generate_password(),
	PatchBody =  "{\"secret\" : \""  ++ NewSecret ++ "\"}",
	PatchBodyLen = size(list_to_binary(PatchBody)),
	PatchUri = "/ocs/v1/client/" ++ ID,
	TS = integer_to_list(erlang:system_time(milli_seconds)),
	N = integer_to_list(erlang:unique_integer([positive])),
	NewEtag = TS ++ "-" ++ N,
	PatchReq = ["PATCH ", PatchUri, " HTTP/1.1",$\r,$\n,
			"Content-Type:application/json", $\r,$\n, "Accept:application/json",$\r,$\n,
			"If-match:" ++ NewEtag,$\r,$\n,"Authorization:"++ basic_auth(),$\r,$\n,
			"Host:localhost:" ++ integer_to_list(RestPort),$\r,$\n,
			"Content-Length:" ++ integer_to_list(PatchBodyLen),$\r,$\n,
			$\r,$\n,
			PatchBody],
	ok = ssl:send(SslSock, list_to_binary(PatchReq)),
	Timeout = 1500,
	F = fun(_F, _Sock, {error, timeout}, Acc) ->
					lists:reverse(Acc);
			(F, Sock, {ok, Bin}, Acc) ->
					F(F, Sock, ssl:recv(Sock, 0, Timeout), [Bin | Acc])
	end,
	RecvBuf = F(F, SslSock, ssl:recv(SslSock, 0, Timeout), []),
	PatchResponse = list_to_binary(RecvBuf),
	[H, _ErroMsg] = binary:split(PatchResponse, <<$\r,$\n,$\r,$\n>>),
	<<"HTTP/1.1 412", _/binary>> = H,
	ok = ssl:close(SslSock).

update_client_password_json_patch() ->
	[{userdata, [{doc,"Use HTTP PATCH to update client's password using
			json-patch media type"}]}].

update_client_password_json_patch(Config) ->
	ContentType = "application/json",
	ID = "10.21.65.83",
	Port = 3781,
	Protocol = "RADIUS",
	Secret = ocs:generate_password(),
	JSON = {struct, [{"id", ID}, {"port", Port}, {"protocol", Protocol},
		{"secret", Secret}]},
	RequestBody = lists:flatten(mochijson:encode(JSON)),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Request1 = {HostUrl ++ "/ocs/v1/client/", [Accept, auth_header()], ContentType, RequestBody},
	{ok, Result} = httpc:request(post, Request1, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, ResponseBody} = Result,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers),
	{_, Etag} = lists:keyfind("etag", 1, Headers),
	true = is_etag_valid(Etag),
	ContentLength = integer_to_list(length(ResponseBody)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{_, URI} = lists:keyfind("location", 1, Headers),
	{"/ocs/v1/client/" ++ ID, _} = httpd_util:split_path(URI),
	{struct, Object} = mochijson:decode(ResponseBody),
	{_, ID} = lists:keyfind("id", 1, Object),
	{_, URI} = lists:keyfind("href", 1, Object),
	{_, Port} = lists:keyfind("port", 1, Object),
	{_, Protocol} = lists:keyfind("protocol", 1, Object),
	{_, Secret} = lists:keyfind("secret", 1, Object),
	RestPort = ?config(port, Config),
	{ok, SslSock} = ssl:connect({127,0,0,1}, RestPort,  [binary, {active, false}], infinity),
	NewContentType = "application/json-patch+json",
	NewSecret = ocs:generate_password(),
	JSON1 = {array, [{struct, [{op, "replace"}, {path, "/secret"}, {value, NewSecret}]}]},
	PatchBody = lists:flatten(mochijson:encode(JSON1)),
	PatchBodyLen = size(list_to_binary(PatchBody)),
	PatchUri = "/ocs/v1/client/" ++ ID,
	PatchReq = ["PATCH ", PatchUri, " HTTP/1.1",$\r,$\n,
			"Content-Type:"++ NewContentType, $\r,$\n, "Accept:application/json",$\r,$\n,
			"If-match:" ++ Etag,$\r,$\n,"Authorization:"++ basic_auth(),$\r,$\n,
			"Host:localhost:" ++ integer_to_list(RestPort),$\r,$\n,
			"Content-Length:" ++ integer_to_list(PatchBodyLen),$\r,$\n,
			$\r,$\n,
			PatchBody],
	ok = ssl:send(SslSock, list_to_binary(PatchReq)),
	Timeout = 1500,
	F = fun(_F, _Sock, {error, timeout}, Acc) ->
					lists:reverse(Acc);
			(F, Sock, {ok, Bin}, Acc) ->
					F(F, Sock, ssl:recv(Sock, 0, Timeout), [Bin | Acc])
	end,
	RecvBuf = F(F, SslSock, ssl:recv(SslSock, 0, Timeout), []),
	PatchResponse = list_to_binary(RecvBuf),
	[Headers1, ResponseBody1] = binary:split(PatchResponse, <<$\r,$\n,$\r,$\n>>),
	<<"HTTP/1.1 200", _/binary>> = Headers1,
	{struct, Object1} = mochijson:decode(ResponseBody1),
	{_, ID} = lists:keyfind("id", 1, Object1),
	{_, URI} = lists:keyfind("href", 1, Object1),
	{_, Port} = lists:keyfind("port", 1, Object1),
	{_, Protocol} = lists:keyfind("protocol", 1, Object1),
	{_, NewSecret} = lists:keyfind("secret", 1, Object1),
	ok = ssl:close(SslSock).

update_client_attributes_json_patch() ->
	[{userdata, [{doc,"Use HTTP PATCH to update client's attributes using
			json-patch media type"}]}].

update_client_attributes_json_patch(Config) ->
	ContentType = "application/json",
	ID = "103.73.94.4",
	Port = 2768,
	Protocol = "RADIUS",
	Secret = ocs:generate_password(),
	JSON = {struct, [{"id", ID}, {"port", Port}, {"protocol", Protocol},
		{"secret", Secret}]},
	RequestBody = lists:flatten(mochijson:encode(JSON)),
	HostUrl = ?config(host_url, Config),
	Accept = {"accept", "application/json"},
	Request1 = {HostUrl ++ "/ocs/v1/client/", [Accept, auth_header()], ContentType, RequestBody},
	{ok, Result} = httpc:request(post, Request1, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, ResponseBody} = Result,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers),
	{_, Etag} = lists:keyfind("etag", 1, Headers),
	true = is_etag_valid(Etag),
	ContentLength = integer_to_list(length(ResponseBody)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{_, URI} = lists:keyfind("location", 1, Headers),
	{"/ocs/v1/client/" ++ ID, _} = httpd_util:split_path(URI),
	{struct, Object} = mochijson:decode(ResponseBody),
	{_, ID} = lists:keyfind("id", 1, Object),
	{_, URI} = lists:keyfind("href", 1, Object),
	{_, Port} = lists:keyfind("port", 1, Object),
	{_, Protocol} = lists:keyfind("protocol", 1, Object),
	{_, Secret} = lists:keyfind("secret", 1, Object),
	RestPort = ?config(port, Config),
	{ok, SslSock} = ssl:connect({127,0,0,1}, RestPort,  [binary, {active, false}], infinity),
	NewContentType = "application/json-patch+json",
	NewPort = 8745,
	NewProtocol = "DIAMETER",
	JSON1 = {array, [{struct, [{op, "replace"}, {path, "/port"}, {value, NewPort}]},
			{struct, [{op, "replace"}, {path, "/protocol"}, {value, NewProtocol}]}]},
	PatchBody = lists:flatten(mochijson:encode(JSON1)),
	PatchBodyLen = size(list_to_binary(PatchBody)),
	PatchUri = "/ocs/v1/client/" ++ ID,
	PatchReq = ["PATCH ", PatchUri, " HTTP/1.1",$\r,$\n,
			"Content-Type:"++ NewContentType, $\r,$\n, "Accept:application/json",$\r,$\n,
			"If-match:" ++ Etag,$\r,$\n,"Authorization:"++ basic_auth(),$\r,$\n,
			"Host:localhost:" ++ integer_to_list(RestPort),$\r,$\n,
			"Content-Length:" ++ integer_to_list(PatchBodyLen),$\r,$\n,
			$\r,$\n,
			PatchBody],
	ok = ssl:send(SslSock, list_to_binary(PatchReq)),
	Timeout = 1500,
	F = fun(_F, _Sock, {error, timeout}, Acc) ->
					lists:reverse(Acc);
			(F, Sock, {ok, Bin}, Acc) ->
					F(F, Sock, ssl:recv(Sock, 0, Timeout), [Bin | Acc])
	end,
	RecvBuf = F(F, SslSock, ssl:recv(SslSock, 0, Timeout), []),
	PatchResponse = list_to_binary(RecvBuf),
	[Headers1, ResponseBody1] = binary:split(PatchResponse, <<$\r,$\n,$\r,$\n>>),
	<<"HTTP/1.1 200", _/binary>> = Headers1,
	{struct, Object1} = mochijson:decode(ResponseBody1),
	{_, ID} = lists:keyfind("id", 1, Object1),
	{_, URI} = lists:keyfind("href", 1, Object1),
	{_, NewPort} = lists:keyfind("port", 1, Object1),
	{_, NewProtocol} = lists:keyfind("protocol", 1, Object1),
	{_, Secret} = lists:keyfind("secret", 1, Object1),
	ok = ssl:close(SslSock).

post_hub_balance() ->
	[{userdata, [{doc, "Register hub listener for balance"}]}].

post_hub_balance(Config) ->
	HostUrl = ?config(host_url, Config),
	PathHub = ?PathBalanceHub,
	CollectionUrl = HostUrl ++ PathHub,
	Callback = "http://in.listener.com",
	RequestBody = "{\n"
			++ "\t\"callback\": \"" ++ Callback ++ "\",\n"
			++ "}\n",
	ContentType = "application/json",
	Accept = {"accept", "application/json"},
	Request = {CollectionUrl, [Accept, auth_header()], ContentType, RequestBody},
	{ok, Result} = httpc:request(post, Request, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, ResponseBody} = Result,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers),
	ContentLength = integer_to_list(length(ResponseBody)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{_, Location} = lists:keyfind("location", 1, Headers),
	Id = string:substr(Location, string:rstr(Location, PathHub) + length(PathHub)),
	{struct, HubList} = mochijson:decode(ResponseBody),
	{_, Callback} = lists:keyfind("callback", 1, HubList),
	{_, Id} = lists:keyfind("id", 1, HubList),
	{_, null} = lists:keyfind("query", 1, HubList).

delete_hub_balance() ->
	[{userdata, [{doc, "Unregister hub listener for balance"}]}].

delete_hub_balance(Config) ->
	HostUrl = ?config(host_url, Config),
	PathHub = ?PathBalanceHub,
	CollectionUrl = HostUrl ++ PathHub,
	Callback = "http://in.listener.com",
	RequestBody = "{\"callback\":\"" ++ Callback ++ "\"}",
	ContentType = "application/json",
	Accept = {"accept", "application/json"},
	Request = {CollectionUrl, [Accept, auth_header()], ContentType, RequestBody},
	{ok, {{_, 201, _}, _, ResponseBody}} = httpc:request(post, Request, [], []),
	{struct, HubList} = mochijson:decode(ResponseBody),
	{_, Id} = lists:keyfind("id", 1, HubList),
	Request1 = {HostUrl ++ PathHub ++ Id, [Accept, auth_header()]},
	{ok, {{_, 204, _}, _, []}} = httpc:request(delete, Request1, [], []).

notify_create_bucket() ->
	[{userdata, [{doc, "Receive balance creation notification."}]}].

notify_create_bucket(Config) ->
	HostUrl = ?config(host_url, Config),
	CollectionUrl = HostUrl ++ ?PathBalanceHub,
	ListenerPort = ?config(listener_port, Config),
	ListenerServer = "http://localhost:" ++ integer_to_list(ListenerPort),
	Callback = ListenerServer ++ "/listener/"
			++ atom_to_list(?MODULE) ++ "/notifycreatebucket",
	RequestBody = "{\n"
			++ "\t\"callback\": \"" ++ Callback ++ "\",\n"
			++ "}\n",
	ContentType = "application/json",
	Accept = {"accept", "application/json"},
	Request = {CollectionUrl, [Accept, auth_header()], ContentType, RequestBody},
	{ok, {{_, 201, _}, _, _}} = httpc:request(post, Request, [], []),
	Price = #price{name = ocs:generate_identity(),
			type = usage, units = octets, size = 1000, amount = 100},
	Offer = #offer{name = ocs:generate_identity(),
			price = [Price], specification = 4},
	{ok, #offer{name = OfferId}} = ocs:add_offer(Offer),
	{ok, #product{id = ProdRef}} = ocs:add_product(OfferId, [], []),
	receive
		Input1 ->
			{struct, ProductEvent} = mochijson:decode(Input1),
			{_, "ResourceCreateEvent"}
					= lists:keyfind("eventType", 1, ProductEvent),
			{_, {struct, ProductList}} = lists:keyfind("event", 1, ProductEvent),
			{_, ProdRef} = lists:keyfind("id", 1, ProductList)
	end,
	Bucket = #bucket{units = cents, remain_amount = 100,
			start_date = erlang:system_time(milli_seconds),
			end_date = erlang:system_time(milli_seconds) + 2592000000},
	{ok, _, #bucket{}} = ocs:add_bucket(ProdRef, Bucket),
	Balance = receive
		Input2 ->
			{struct, BalanceEvent} = mochijson:decode(Input2),
			{_, "ResourceCreateEvent"}
					= lists:keyfind("eventType", 1, BalanceEvent),
			{_, {struct, BalanceList}} = lists:keyfind("event", 1, BalanceEvent),
			BalanceList
	end,
	{_, {struct, RemainAmount}} = lists:keyfind("remainedAmount", 1, Balance),
	{_, "cents"} = lists:keyfind("units", 1, RemainAmount),
	{_, MillionthsOut} = lists:keyfind("amount", 1, RemainAmount),
	100 = ocs_rest:millionths_in(MillionthsOut).

notify_delete_expired_bucket() ->
	[{userdata, [{doc, "Receive expired bucket deletion notification."}]}].

notify_delete_expired_bucket(Config) ->
	HostUrl = ?config(host_url, Config),
	CollectionUrl = HostUrl ++ ?PathBalanceHub,
	ListenerPort = ?config(listener_port, Config),
	ListenerServer = "http://localhost:" ++ integer_to_list(ListenerPort),
	Callback = ListenerServer ++ "/listener/"
			++ atom_to_list(?MODULE) ++ "/notifyexpiredbucket",
	RequestBody = "{\n"
			++ "\t\"callback\": \"" ++ Callback ++ "\",\n"
			++ "}\n",
	ContentType = "application/json",
	Accept = {"accept", "application/json"},
	Request = {CollectionUrl, [Accept, auth_header()], ContentType, RequestBody},
	{ok, {{_, 201, _}, _, _}} = httpc:request(post, Request, [], []),
	Price = #price{name = ocs:generate_identity(),
			type = usage, units = octets, size = 1000, amount = 100},
	Offer = #offer{name = ocs:generate_identity(),
			price = [Price], specification = 4},
	{ok, #offer{name = OfferId}} = ocs:add_offer(Offer),
	{ok, #product{id = ProdRef}} = ocs:add_product(OfferId, [], []),
	receive
		Input1 ->
			{struct, ProductEvent} = mochijson:decode(Input1),
			{_, "ResourceCreateEvent"}
					= lists:keyfind("eventType", 1, ProductEvent),
			{_, {struct, ProductList}} = lists:keyfind("event", 1, ProductEvent),
			{_, ProdRef} = lists:keyfind("id", 1, ProductList)
	end,
	Bucket = #bucket{units = cents, remain_amount = 100,
			start_date = erlang:system_time(milli_seconds),
			end_date = erlang:system_time(milli_seconds) + 2592000000},
	{ok, _, #bucket{id = Id}} = ocs:add_bucket(ProdRef, Bucket),
	{_, "ResourceCreateEvent"} = receive
		Input2 ->
			{struct, BalanceEvent1} = mochijson:decode(Input2),
			lists:keyfind("eventType", 1, BalanceEvent1)
	end,
	ok = ocs:delete_bucket(Id),
	{_, Id} = receive
		Input3 ->
			{struct, BalanceEvent2} = mochijson:decode(Input3),
			{_, "ResourceExpiredEvent"}
					= lists:keyfind("eventType", 1, BalanceEvent2),
			{_, {struct, BalanceList}} = lists:keyfind("event", 1, BalanceEvent2),
			lists:keyfind("id", 1, BalanceList)
	end.

post_hub_product() ->
	[{userdata, [{doc, "Register hub listener for product"}]}].

post_hub_product(Config) ->
	HostUrl = ?config(host_url, Config),
	PathHub = ?PathProductHub,
	CollectionUrl = HostUrl ++ PathHub,
	Callback = "http://in.listener.com",
	RequestBody = "{\n"
			++ "\t\"callback\": \"" ++ Callback ++ "\",\n"
			++ "}\n",
	ContentType = "application/json",
	Accept = {"accept", "application/json"},
	Request = {CollectionUrl, [Accept, auth_header()], ContentType, RequestBody},
	{ok, Result} = httpc:request(post, Request, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, ResponseBody} = Result,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers),
	ContentLength = integer_to_list(length(ResponseBody)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{_, Location} = lists:keyfind("location", 1, Headers),
	Id = string:substr(Location, string:rstr(Location, PathHub) + length(PathHub)),
	{struct, HubList} = mochijson:decode(ResponseBody),
	{_, Callback} = lists:keyfind("callback", 1, HubList),
	{_, Id} = lists:keyfind("id", 1, HubList),
	{_, null} = lists:keyfind("query", 1, HubList).

delete_hub_product() ->
	[{userdata, [{doc, "Unregister hub listener for product"}]}].

delete_hub_product(Config) ->
	HostUrl = ?config(host_url, Config),
	PathHub = ?PathProductHub,
	CollectionUrl = HostUrl ++ PathHub,
	Callback = "http://in.listener.com",
	RequestBody = "{\"callback\":\"" ++ Callback ++ "\"}",
	ContentType = "application/json",
	Accept = {"accept", "application/json"},
	Request = {CollectionUrl, [Accept, auth_header()], ContentType, RequestBody},
	{ok, {{_, 201, _}, _, ResponseBody}} = httpc:request(post, Request, [], []),
	{struct, HubList} = mochijson:decode(ResponseBody),
	{_, Id} = lists:keyfind("id", 1, HubList),
	Request1 = {HostUrl ++ PathHub ++ Id, [Accept, auth_header()]},
	{ok, {{_, 204, _}, _, []}} = httpc:request(delete, Request1, [], []).

notify_create_product() ->
	[{userdata, [{doc, "Receive product creation notification."}]}].

notify_create_product(Config) ->
	HostUrl = ?config(host_url, Config),
	CollectionUrl = HostUrl ++ ?PathProductHub,
	ListenerPort = ?config(listener_port, Config),
	ListenerServer = "http://localhost:" ++ integer_to_list(ListenerPort),
	Callback = ListenerServer ++ "/listener/"
			++ atom_to_list(?MODULE) ++ "/notifycreateproduct",
	RequestBody = "{\n"
			++ "\t\"callback\": \"" ++ Callback ++ "\",\n"
			++ "}\n",
	ContentType = "application/json",
	Accept = {"accept", "application/json"},
	Request = {CollectionUrl, [Accept, auth_header()], ContentType, RequestBody},
	{ok, {{_, 201, _}, _, _}} = httpc:request(post, Request, [], []),
	Price = #price{name = ocs:generate_identity(),
			type = usage, units = octets, size = 1000, amount = 100},
	Offer = #offer{name = ocs:generate_identity(),
			price = [Price], specification = 4},
	{ok, #offer{name = OfferId}} = ocs:add_offer(Offer),
	{ok, #product{id = ProductId}} = ocs:add_product(OfferId, [], []),
	Product = receive
		Input ->
			{struct, ProductEvent} = mochijson:decode(Input),
			{_, "ResourceCreateEvent"}
					= lists:keyfind("eventType", 1, ProductEvent),
			{_, {struct, ProductList}} = lists:keyfind("event", 1, ProductEvent),
			ProductList
	end,
	{_, ProductId} = lists:keyfind("id", 1, Product),
	{_, {struct, OfferStruct}} = lists:keyfind("productOffering", 1, Product),
	{_, OfferId} = lists:keyfind("id", 1, OfferStruct).

post_hub_service() ->
	[{userdata, [{doc, "Register hub listener for service"}]}].

post_hub_service(Config) ->
	HostUrl = ?config(host_url, Config),
	PathHub = ?PathServiceHub,
	CollectionUrl = HostUrl ++ PathHub,
	Callback = "http://in.listener.com",
	RequestBody = "{\n"
			++ "\t\"callback\": \"" ++ Callback ++ "\",\n"
			++ "}\n",
	ContentType = "application/json",
	Accept = {"accept", "application/json"},
	Request = {CollectionUrl, [Accept, auth_header()], ContentType, RequestBody},
	{ok, Result} = httpc:request(post, Request, [], []),
	{{"HTTP/1.1", 201, _Created}, Headers, ResponseBody} = Result,
	{_, "application/json"} = lists:keyfind("content-type", 1, Headers),
	ContentLength = integer_to_list(length(ResponseBody)),
	{_, ContentLength} = lists:keyfind("content-length", 1, Headers),
	{_, Location} = lists:keyfind("location", 1, Headers),
	Id = string:substr(Location, string:rstr(Location, PathHub) + length(PathHub)),
	{struct, HubList} = mochijson:decode(ResponseBody),
	{_, Callback} = lists:keyfind("callback", 1, HubList),
	{_, Id} = lists:keyfind("id", 1, HubList),
	{_, null} = lists:keyfind("query", 1, HubList).

notify_create_service() ->
	[{userdata, [{doc, "Receive service creation notification."}]}].

notify_create_service(Config) ->
	HostUrl = ?config(host_url, Config),
	CollectionUrl = HostUrl ++ ?PathServiceHub,
	ListenerPort = ?config(listener_port, Config),
	ListenerServer = "http://localhost:" ++ integer_to_list(ListenerPort),
	Callback = ListenerServer ++ "/listener/"
			++ atom_to_list(?MODULE) ++ "/notifycreateservice",
	RequestBody = "{\n"
			++ "\t\"callback\": \"" ++ Callback ++ "\",\n"
			++ "}\n",
	ContentType = "application/json",
	Accept = {"accept", "application/json"},
	Request = {CollectionUrl, [Accept, auth_header()], ContentType, RequestBody},
	{ok, {{_, 201, _}, _, _}} = httpc:request(post, Request, [], []),
	Identity = ocs:generate_identity(),
	Password = ocs:generate_password(),
	{ok, #service{}} = ocs:add_service(Identity, Password),
	Service = receive
		Input ->
			{struct, ServiceEvent} = mochijson:decode(Input),
			{_, "ResourceCreateEvent"}
					= lists:keyfind("eventType", 1, ServiceEvent),
			{_, {struct, ServiceList}} = lists:keyfind("event", 1, ServiceEvent),
			ServiceList
	end,
	{_, Identity} = lists:keyfind("id", 1, Service),
	{_, {array, Chars}} = lists:keyfind("serviceCharacteristic", 1, Service),
	F = fun({struct, [{"name", "servicePassword"}, {"value", Value}]}) ->
				{true, Value};
			({struct, [{"value", Value}, {"name", "servicePassword"}]}) ->
				{true, Value};
			(_) ->
				false
	end,
	[Password] = lists:filtermap(F, Chars).

delete_hub_service() ->
	[{userdata, [{doc, "Unregister hub listener for service"}]}].

delete_hub_service(Config) ->
	HostUrl = ?config(host_url, Config),
	PathHub = ?PathServiceHub,
	CollectionUrl = HostUrl ++ PathHub,
	Callback = "http://in.listener.com",
	RequestBody = "{\"callback\":\"" ++ Callback ++ "\"}",
	ContentType = "application/json",
	Accept = {"accept", "application/json"},
	Request = {CollectionUrl, [Accept, auth_header()], ContentType, RequestBody},
	{ok, {{_, 201, _}, _, ResponseBody}} = httpc:request(post, Request, [], []),
	{struct, HubList} = mochijson:decode(ResponseBody),
	{_, Id} = lists:keyfind("id", 1, HubList),
	Request1 = {HostUrl ++ PathHub ++ Id, [Accept, auth_header()]},
	{ok, {{_, 204, _}, _, []}} = httpc:request(delete, Request1, [], []).

%%---------------------------------------------------------------------
%%  Internal functions
%%---------------------------------------------------------------------

-spec notifycreatebucket(SessionID :: term(), Env :: list(),
		Input :: string()) -> any().
%% @doc Notification callback for notify_create_bucket test case.
notifycreatebucket(SessionID, _Env, Input) ->
	mod_esi:deliver(SessionID, "status: 201 Created\r\n\r\n"),
	notify_create_bucket ! Input.

-spec notifyexpiredbucket(SessionID :: term(), Env :: list(),
		Input :: string()) -> any().
%% @doc Notification callback for notify_delete_expired_bucket test case.
notifyexpiredbucket(SessionID, _Env, Input) ->
	mod_esi:deliver(SessionID, "status: 201 Created\r\n\r\n"),
	notify_delete_expired_bucket ! Input.

-spec notifycreateproduct(SessionID :: term(), Env :: list(),
		Input :: string()) -> any().
%% @doc Notification callback for notify_create_product test case.
notifycreateproduct(SessionID, _Env, Input) ->
	mod_esi:deliver(SessionID, "status: 201 Created\r\n\r\n"),
	notify_create_product ! Input.

-spec notifycreateservice(SessionID :: term(), Env :: list(),
		Input :: string()) -> any().
%% @doc Notification callback for notify_create_service test case.
notifycreateservice(SessionID, _Env, Input) ->
	mod_esi:deliver(SessionID, "status: 201 Created\r\n\r\n"),
	notify_create_service ! Input.

product_offer() ->
	CatalogHref = "/catalogManagement/v2",
	ProdName = {"name", ocs:generate_password()},
	ProdDescirption = {"description", ocs:generate_password()},
	IsBundle = {"isBundle", false},
	IsCustomerVisible = {"isCustomerVisible", true},
	Status = {"lifecycleStatus", "Active"},
	StartTime = {"startDateTime", ocs_rest:iso8601(erlang:system_time(?MILLISECOND))},
	EndTime = {"endDateTime", ocs_rest:iso8601(erlang:system_time(?MILLISECOND)  + 2678400000)},
	ValidFor = {"validFor", {struct, [StartTime, EndTime]}},
	ProdSpecID = {"id", "1"},
	ProdSpecHref = {"href", CatalogHref ++ "/productSpecification/1"},
	ProdSpec = {"productSpecification", {struct, [ProdSpecID, ProdSpecHref]}},
	POPName1 = {"name", ocs:generate_password()},
	POPDescription1 = {"description", ocs:generate_password()},
	POPStartDateTime1 = {"startDateTime", ocs_rest:iso8601(erlang:system_time(?MILLISECOND))},
	POPEndDateTime1 = {"endDateTime", ocs_rest:iso8601(erlang:system_time(?MILLISECOND)  + 2678400000)},
	POPValidFor1 = {"validFor", {struct, [POPStartDateTime1, POPEndDateTime1]}},
	POPPriceType1 = {"priceType", "recurring"},
	POPPriceTaxInclude1 = {"taxIncludedAmount", integer_to_list(rand:uniform(10000))},
	POPPriceCurrency1 = {"currencyCode", "USD"},
	POPPrice1 = {"price", {struct, [POPPriceTaxInclude1, POPPriceCurrency1]}},
	POPRecChargPeriod1 = {"recurringChargePeriod", "monthly"},
	ProdOfferPrice1 = {struct, [POPName1, POPDescription1, POPValidFor1,
			POPPriceType1, POPPrice1, POPRecChargPeriod1]},
	POPName2 = {"name", "usage"},
	POPDescription2 = {"description", ocs:generate_password()},
	POPStratDateTime2 = {"startDateTime", ocs_rest:iso8601(erlang:system_time(?MILLISECOND))},
	POPEndDateTime2 = {"endDateTime", ocs_rest:iso8601(erlang:system_time(?MILLISECOND)  + 2678400000)},
	POPValidFor2 = {"validFor", {struct, [POPStratDateTime2, POPEndDateTime2]}},
	POPPriceType2 = {"priceType", "usage"},
	POPUOMeasure2 = {"unitOfMeasure", "1g"},
	POPPriceTaxInclude2 = {"taxIncludedAmount",
			integer_to_list(rand:uniform(1000)) ++ "." ++ integer_to_list(rand:uniform(999999))},
	POPPriceCurrency2 = {"currencyCode", "USD"},
	POPPrice2 = {"price", {struct, [POPPriceTaxInclude2, POPPriceCurrency2]}},
	ProdAlterName = {"name", "allowance"},
	ProdAlterDescription = {"description", ocs:generate_password()},
	ProdAlterValidFor = {"validFor", {struct, [POPStartDateTime1]}},
	ProdAlterPriceType = {"priceType", "usage"},
	ProdAlterUOMeasure = {"unitOfMeasure", "100g"},
	ProdAlterAmount = {"taxIncludedAmount", "0"},
	POPPAlterCurrency = {"currencyCode", "USD"},
	ProdAlterPrice = {"price", {struct, [ProdAlterAmount, POPPAlterCurrency]}},
	POPAlteration = {"productOfferPriceAlteration", {struct, [ProdAlterName, ProdAlterDescription,
		ProdAlterValidFor, ProdAlterPriceType, ProdAlterUOMeasure, ProdAlterPrice]}},
	ProdOfferPrice2 = {struct, [POPName2, POPDescription2, POPValidFor2, POPPriceType2,
			POPPrice2, POPUOMeasure2, POPAlteration]},
	ProdOfferPrice = {"productOfferingPrice", {array, [ProdOfferPrice1, ProdOfferPrice2]}},
	[ProdName, ProdDescirption, IsBundle, IsCustomerVisible, ValidFor, ProdSpec, Status, ProdOfferPrice].

patch_request(SslSock, Port, ContentType, Etag, AuthKey, ProdID, ReqBody) when is_list(ReqBody) ->
	BinBody = list_to_binary(ReqBody),
	patch_request(SslSock, Port, ContentType, Etag, AuthKey, ProdID, BinBody);
patch_request(SslSock, Port, ContentType, Etag, AuthKey, ProdID, ReqBody) ->
	Timeout = 1500,
	Length = size(ReqBody),
	CatalogHref = "/catalogManagement/v2",
	PatchURI = CatalogHref ++ "/productOffering/" ++ ProdID,
	Request =
			["PATCH ", PatchURI, " HTTP/1.1",$\r,$\n,
			"Content-Type:"++ ContentType, $\r,$\n,
			"Accept:application/json",$\r,$\n,
			"Authorization:"++ AuthKey,$\r,$\n,
			"Host:localhost:" ++ integer_to_list(Port),$\r,$\n,
			"Content-Length:" ++ integer_to_list(Length),$\r,$\n,
			"If-match:" ++ Etag,$\r,$\n,
			$\r,$\n,
			ReqBody],
	ok = ssl:send(SslSock, Request),
	F = fun(_F, _Sock, {error, timeout}, Acc) ->
					lists:reverse(Acc);
			(F, Sock, {ok, Bin}, Acc) ->
					F(F, Sock, ssl:recv(Sock, 0, Timeout), [Bin | Acc])
	end,
	RecvBuf = F(F, SslSock, ssl:recv(SslSock, 0, Timeout), []),
	PatchResponse = list_to_binary(RecvBuf),
	[Headers, ResponseBody] = binary:split(PatchResponse, <<$\r,$\n,$\r,$\n>>),
	{Headers, ResponseBody}.

ssl_socket_open(IP, Port) ->
	{ok, SslSock} = ssl:connect(IP, Port,
		[binary, {active, false}], infinity),
	SslSock.

ssl_socket_close(SslSock) ->
	ok = ssl:close(SslSock).

product_name(ProdID) ->
	Op = {"op", "replace"},
	Path = {"path", "/name"},
	Value = {"value", ProdID},
	{struct, [Op, Path, Value]}.

product_description() ->
	Description = ocs:generate_password(),
	Op = {"op", "replace"},
	Path = {"path", "/description"},
	Value = {"value", Description},
	{struct, [Op, Path, Value]}.

product_status() ->
	Status = "In Design", 
	Op = {"op", "replace"},
	Path = {"path", "/lifecycleStatus"},
	Value = {"value", Status},
	{struct, [Op, Path, Value]}.

prod_price_name() ->
	Name = ocs:generate_password(),
	Op = {"op", "replace"},
	Path = {"path", "/productOfferingPrice/1/name"},
	Value = {"value", Name},
	{struct, [Op, Path, Value]}.

prod_price_description() ->
	Description = ocs:generate_password(),
	Op = {"op", "replace"},
	Path = {"path", "/productOfferingPrice/1/description"},
	Value = {"value", Description},
	{struct, [Op, Path, Value]}.

prod_price_rc_period() ->
	Period = "yearly",
	Op = {"op", "add"},
	Path = {"path", "/productOfferingPrice/1/recurringChargePeriod"},
	Value = {"value", Period},
	{struct, [Op, Path, Value]}.

prod_price_ufm() ->
	UFM = "10000b",
	Op = {"op", "replace"},
	Path = {"path", "/productOfferingPrice/1/unitOfMeasure"},
	Value = {"value", UFM},
	{struct, [Op, Path, Value]}.

prod_price_type() ->
	PT = "recurring",
	Op = {"op", "replace"},
	Path = {"path", "/productOfferingPrice/1/priceType"},
	Value = {"value", PT},
	{struct, [Op, Path, Value]}.

pp_alter_name() ->
	Name = ocs:generate_password(),
	Op = {"op", "replace"},
	Path = {"path", "/productOfferingPrice/1/productOfferPriceAlteration/name"},
	Value = {"value", Name},
	{struct, [Op, Path, Value]}.

pp_alter_description() ->
	Description = ocs:generate_password(),
	Op = {"op", "replace"},
	Path = {"path", "/productOfferingPrice/1/productOfferPriceAlteration/description"},
	Value = {"value", Description},
	{struct, [Op, Path, Value]}.

pp_alter_type() ->
	PT = "recurring",
	Op = {"op", "replace"},
	Path = {"path", "/productOfferingPrice/1/productOfferPriceAlteration/priceType"},
	Value = {"value", PT},
	{struct, [Op, Path, Value]}.

pp_alter_ufm() ->
	UFM = "1000b",
	Op = {"op", "replace"},
	Path = {"path", "/productOfferingPrice/1/productOfferPriceAlteration/unitOfMeasure"},
	Value = {"value", UFM},
	{struct, [Op, Path, Value]}.

%% @hidden
is_etag_valid(Etag) ->
	[X1, X2] = string:tokens(Etag, "-"),
	true = is_integer(list_to_integer(X1)),
	true = is_integer(list_to_integer(X2)).

%% @hidden
basic_auth() ->
	RestUser = ct:get_config(rest_user),
	RestPass = ct:get_config(rest_pass),
	EncodeKey = base64:encode_to_string(string:concat(RestUser ++ ":", RestPass)),
	"Basic " ++ EncodeKey.

%% @hidden
auth_header() ->
	{"authorization", basic_auth()}.

%% @hidden
price(Type, Units, Size, Amount) ->
	#price{name = ocs:generate_identity(),
			type = Type, units = Units,
			size = Size, amount = Amount}.

%% @hidden
b(Units, RA) ->
	#bucket{units = Units, remain_amount = RA,
		start_date = erlang:system_time(?MILLISECOND),
		end_date = erlang:system_time(?MILLISECOND) + 2592000000}.

%% @hidden
offer_add(Prices, Spec) when is_integer(Spec) ->
	offer_add(Prices, integer_to_list(Spec));
offer_add(Prices, Spec) ->
	Offer = #offer{name = ocs:generate_identity(),
	price = Prices, specification = Spec},
	{ok, #offer{name = OfferId}} = ocs:add_offer(Offer),
	OfferId.

%% @hidden
product_add(OfferId) ->
	product_add(OfferId, []).
product_add(OfferId, Chars) ->
	{ok, #product{id = ProdRef}} = ocs:add_product(OfferId, [], Chars),
	ProdRef.

%% @hidden
service_add(ProdRef) ->
	ServiceId = ocs:generate_identity(),
	{ok, _Service1} =
			ocs:add_service(ServiceId, ocs:generate_password(),
			ProdRef, []),
	ServiceId.

%% @hidden
bucket_add(ProdRef, Bucket) ->
	{ok, _, #bucket{id = BId}} = ocs:add_bucket(ProdRef, Bucket),
	BId.

%% @hidden
binary_to_hex(B) ->
	binary_to_hex(B, []).
%% @hidden
binary_to_hex(<<N:4, Rest/bits>>, Acc) when N >= 10 ->
	binary_to_hex(Rest, [N - 10 + $a | Acc]);
binary_to_hex(<<N:4, Rest/bits>>, Acc) ->
	binary_to_hex(Rest, [N + $0 | Acc]);
binary_to_hex(<<>>, Acc) ->
	lists:reverse(Acc).

