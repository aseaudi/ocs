%%% mod_ocs_rest_get.erl
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
-module(mod_ocs_rest_get).
-copyright('Copyright (c) 2016 - 2021 SigScale Global Inc.').

-export([do/1]).

-include_lib("inets/include/httpd.hrl").

-spec do(ModData) -> Result when
	ModData :: #mod{},
	Result :: {proceed, OldData} | {proceed, NewData} | {break, NewData} | done,
	OldData :: list(),
	NewData :: [{response,{StatusCode,Body}}] | [{response,{response,Head,Body}}]
			| [{response,{already_sent,StatusCode,Size}}],
	StatusCode :: integer(),
	Body :: list() | nobody | {Fun, Arg},
	Head :: [HeaderOption],
	HeaderOption :: {Option, Value} | {code, StatusCode},
	Option :: accept_ranges | allow
			| cache_control | content_MD5
			| content_encoding | content_language
			| content_length | content_location
			| content_range | content_type | date
			| etag | expires | last_modified
			| location | pragma | retry_after
			| server | trailer | transfer_encoding,
	Value :: string(),
	Size :: term(),
	Fun :: fun((Arg) -> sent| close | Body),
	Arg :: [term()].
%% @doc Erlang web server API callback function.
do(#mod{method = Method, parsed_header = Headers, request_uri = Uri,
		data = Data} = ModData) ->
	case Method of
		"GET" ->
			case proplists:get_value(status, Data) of
				{_StatusCode, _PhraseArgs, _Reason} ->
					{proceed, Data};
				undefined ->
					case proplists:get_value(response, Data) of
						undefined ->
							case lists:keyfind(resource, 1, Data) of
								false ->
									{proceed, Data};
								{_, Resource} ->
									Path = http_uri:decode(Uri),
									content_type_available(Headers, Path, Resource, ModData)
							end;
						_Response ->
							{proceed,  Data}
					end
			end;
		_ ->
			{proceed, Data}
	end.

%% @hidden
content_type_available(Headers, Uri, Resource, #mod{data = Data} = ModData) ->
	case lists:keyfind("accept", 1, Headers) of
		{_, RequestingType} ->
			AvailableTypes = Resource:content_types_provided(),
			case lists:member(RequestingType, AvailableTypes) of
				true ->
					parse_query(Resource, ModData, httpd_util:split_path(Uri));
				false ->
					Response = "<h2>HTTP Error 415 - Unsupported Media Type</h2>",
					{proceed, [{response, {415, Response}} | Data]}
			end;
		_ ->
			parse_query(Resource, ModData, httpd_util:split_path(Uri))
	end.

%% @hidden
parse_query(Resource, ModData, {Path, []}) ->
	do_get(Resource, ModData, string:tokens(Path, "/"), []);
parse_query(Resource, ModData, {Path, "?" ++ Query}) ->
	do_get(Resource, ModData, string:tokens(Path, "/"),
		ocs_rest:parse_query(Query));
parse_query(_, #mod{data = Data} = _ModData, _) ->
	Response = "<h2>HTTP Error 404 - Not Found</h2>",
	{proceed, [{response, {404, Response}} | Data]}.

%% @hidden
do_get(Resource, #mod{parsed_header = Headers} = ModData,
		["ocs", "v1", "client"], Query) ->
	do_response(ModData, Resource:get_clients(Query, Headers));
do_get(Resource, ModData, ["ocs", "v1", "client", Id], Query) ->
	do_response(ModData, Resource:get_client(Id, Query));
do_get(Resource, #mod{parsed_header = Headers} =
		ModData, ["ocs", "v1", "subscriber"], Query) ->
	do_response(ModData, Resource:get_services(Query, Headers));
do_get(Resource, ModData, ["ocs", "v1", "subscriber", Id], Query) ->
	do_response(ModData, Resource:get_subscriber(Id, Query));
do_get(Resource, #mod{parsed_header = Headers} = ModData,
		["usageManagement", "v1", "usage"], Query) ->
	do_response(ModData, Resource:get_usages(Query, Headers));
do_get(Resource, #mod{parsed_header = Headers} = ModData,
		["usageManagement", "v1", "usage", "ipdr", Type, Id], Query) ->
	do_response(ModData, Resource:get_usages(Type, Id, Query, Headers));
do_get(Resource, #mod{parsed_header = Headers} = ModData,
		["usageManagement", "v1", "usage", Id], Query) ->
	do_response(ModData, Resource:get_usage(Id, Query, Headers));
do_get(Resource, ModData,
		["usageManagement", "v1", "usageSpecification"], Query) ->
	do_response(ModData, Resource:get_usagespec(Query));
do_get(Resource, ModData,
		["usageManagement", "v1", "usageSpecification", Id], Query) ->
	do_response(ModData, Resource:get_usagespec(Id, Query));
do_get(Resource, ModData, ["usageManagement", "v1", "hub"], []) ->
	do_response(ModData, Resource:get_usage_hubs());
do_get(Resource, ModData, ["usageManagement", "v1", "hub", Id], []) ->
	do_response(ModData, Resource:get_usage_hub(Id));
do_get(Resource, ModData, ["ocs", "v1", "log", "ipdr", Type], Query) ->
	do_response(ModData, Resource:get_ipdr(Type, Query));
do_get(Resource, ModData, ["ocs", "v1", "log", "http"], []) ->
	do_response(ModData, Resource:get_http());
do_get(Resource, #mod{parsed_header = Headers} = ModData,
		["ocs", "v1", "log", "balance"], Query) ->
	do_response(ModData, Resource:get_balance_log(Query, Headers));
do_get(Resource, #mod{parsed_header = Headers} = ModData,
		["partyManagement", "v1", "individual"], Query) ->
	do_response(ModData, Resource:get_users(Query, Headers));
do_get(Resource, ModData, ["partyManagement", "v1", "individual", Id], Query) ->
	do_response(ModData, Resource:get_user(Id, Query));
do_get(Resource, ModData, ["partyManagement", "v1", "hub"], []) ->
	do_response(ModData, Resource:get_hubs());
do_get(Resource, ModData, ["partyManagement", "v1", "hub", Id], []) ->
	do_response(ModData, Resource:get_hub(Id));
do_get(Resource, ModData, ["balanceManagement", "v1", "product", Id, "accumulatedBalance"], []) ->
	do_response(ModData, Resource:get_balance(Id));
do_get(Resource, ModData, ["balanceManagement", "v1", "product", Id,
		"accumulatedBalance"], Query) ->
	do_response(ModData, Resource:get_balance(Id, Query));
do_get(Resource, ModData, ["balanceManagement", "v1", "service", Id, "accumulatedBalance"], []) ->
	do_response(ModData, Resource:get_balance_service(Id));
do_get(Resource, #mod{parsed_header = Headers} = ModData, ["balanceManagement", "v1", "bucket"], Query) ->
	do_response(ModData, Resource:get_buckets(Query, Headers));
do_get(Resource, ModData, ["balanceManagement", "v1", "bucket", Id], []) ->
	do_response(ModData, Resource:get_bucket(Id));
do_get(Resource, ModData, ["balanceManagement", "v1", "hub"], []) ->
	do_response(ModData, Resource:get_hubs());
do_get(Resource, ModData, ["balanceManagement", "v1", "hub", Id], []) ->
	do_response(ModData, Resource:get_hub(Id));
do_get(Resource, #mod{parsed_header = Headers} = ModData,
		["catalogManagement", "v2", "productOffering"], Query) ->
	do_response(ModData, Resource:get_offers(Query, Headers));
do_get(Resource, ModData, ["catalogManagement", "v2", "productOffering", Id], []) ->
	do_response(ModData, Resource:get_offer(Id));
do_get(Resource, ModData, ["catalogManagement", "v2", "catalog", Id], Query) ->
	do_response(ModData, Resource:get_catalog(Id, Query));
do_get(Resource, ModData, ["catalogManagement", "v2", "catalog"], Query) ->
	do_response(ModData, Resource:get_catalogs(Query));
do_get(Resource, ModData, ["productCatalogManagement", "v2", "productSpecification", Id], Query) ->
	do_response(ModData, Resource:get_product_spec(Id, Query));
do_get(Resource, ModData, ["productCatalogManagement", "v2", "productSpecification"], Query) ->
	do_response(ModData, Resource:get_product_specs(Query));
do_get(Resource, ModData, ["productCatalogManagement", "v2", "catalog", Id], Query) ->
	do_response(ModData, Resource:get_catalog(Id, Query));
do_get(Resource, ModData, ["productCatalogManagement", "v2", "catalog"], Query) ->
	do_response(ModData, Resource:get_catalogs(Query));
do_get(Resource, ModData, ["productCatalogManagement", "v2", "category", Id], Query) ->
	do_response(ModData, Resource:get_category(Id, Query));
do_get(Resource, ModData, ["productCatalogManagement", "v2", "category"], Query) ->
	do_response(ModData, Resource:get_categorys(Query));
do_get(Resource, #mod{parsed_header = Headers} = ModData,
		["productCatalogManagement", "v2", "productOffering"], Query) ->
	do_response(ModData, Resource:get_offers(Query, Headers));
do_get(Resource, ModData, ["productCatalogManagement", "v2", "productOffering", Id], []) ->
	do_response(ModData, Resource:get_offer(Id));
do_get(Resource, ModData, ["productCatalog", "v2", "hub"], []) ->
	do_response(ModData, Resource:get_catalog_hubs());
do_get(Resource, ModData, ["productCatalog", "v2", "hub", Id], []) ->
	do_response(ModData, Resource:get_catalog_hub(Id));
do_get(Resource, ModData, ["catalogManagement", "v2", "category", Id], Query) ->
	do_response(ModData, Resource:get_category(Id, Query));
do_get(Resource, ModData, ["catalogManagement", "v2", "category"], Query) ->
	do_response(ModData, Resource:get_categories(Query));
do_get(Resource, ModData, ["catalogManagement", "v2", "productSpecification", Id], Query) ->
	do_response(ModData, Resource:get_product_spec(Id, Query));
do_get(Resource, ModData, ["catalogManagement", "v2", "productSpecification"], Query) ->
	do_response(ModData, Resource:get_product_specs(Query));
do_get(Resource, ModData, ["catalogManagement", "v2", "plaSpecification", Id], Query) ->
	do_response(ModData, Resource:get_pla_spec(Id, Query));
do_get(Resource, ModData, ["catalogManagement", "v2", "plaSpecification"], Query) ->
	do_response(ModData, Resource:get_pla_specs(Query));
do_get(Resource, ModData, ["catalogManagement", "v2", "serviceSpecification"], Query) ->
	do_response(ModData, Resource:get_service_specs(Query));
do_get(Resource, ModData, ["catalogManagement", "v2", "serviceSpecification", Id], Query) ->
	do_response(ModData, Resource:get_service_spec(Id, Query));
do_get(Resource, ModData, ["catalogManagement", "v2", "pla", Id], []) ->
	do_response(ModData, Resource:get_pla(Id));
do_get(Resource, ModData, ["catalogManagement", "v2", "resourceSpecification", Id], []) ->
	do_response(ModData, Resource:get_resource_spec(Id));
do_get(Resource, ModData, ["catalogManagement", "v2", "resourceSpecification"], Query) ->
	do_response(ModData, Resource:get_resource_specs(Query));
do_get(Resource, ModData, ["catalogManagement", "v2", "resourceCategory", Id], []) ->
	do_response(ModData, Resource:get_resource_category(Id));
do_get(Resource, ModData, ["catalogManagement", "v2", "resourceCategory"], Query) ->
	do_response(ModData, Resource:get_resource_categories(Query));
do_get(Resource, ModData, ["catalogManagement", "v2", "resourceCandidate", Id], []) ->
	do_response(ModData, Resource:get_resource_candidate(Id));
do_get(Resource, ModData, ["catalogManagement", "v2", "resourceCandidate"], Query) ->
	do_response(ModData, Resource:get_resource_candidates(Query));
do_get(Resource, ModData, ["catalogManagement", "v2", "resourceCatalog", Id], []) ->
	do_response(ModData, Resource:get_resource_catalog(Id));
do_get(Resource, ModData, ["catalogManagement", "v2", "resourceCatalog"], Query) ->
	do_response(ModData, Resource:get_resource_catalogs(Query));
do_get(Resource, ModData, ["resourceCatalogManagement", "v2", "resourceCatalog", Id], []) ->
	do_response(ModData, Resource:get_resource_catalog(Id));
do_get(Resource, ModData, ["resourceCatalogManagement", "v2", "resourceCatalog"], Query) ->
	do_response(ModData, Resource:get_resource_catalogs(Query));
do_get(Resource, ModData, ["resourceCatalogManagement", "v2", "resourceSpecification"], Query) ->
	do_response(ModData, Resource:get_resource_specs(Query));
do_get(Resource, ModData, ["resourceCatalogManagement", "v2", "plaSpecification"], Query) ->
	do_response(ModData, Resource:get_pla_specs(Query));
do_get(Resource, ModData, ["resourceCatalogManagement", "v2", "resourceCategory", Id], []) ->
	do_response(ModData, Resource:get_resource_category(Id));
do_get(Resource, ModData, ["resourceCatalogManagement", "v2", "resourceCategory"], Query) ->
	do_response(ModData, Resource:get_resource_categories(Query));
do_get(Resource, ModData, ["resourceCatalogManagement", "v2", "resourceCandidate", Id], []) ->
	do_response(ModData, Resource:get_resource_candidate(Id));
do_get(Resource, ModData, ["resourceCatalogManagement", "v2", "resourceCandidate"], Query) ->
	do_response(ModData, Resource:get_resource_candidates(Query));
do_get(Resource, ModData, ["resourceInventoryManagement", "v1", "logicalResource", Id], Query) ->
	do_response(ModData, Resource:get_resource_inventory(Id, Query));
do_get(Resource, #mod{parsed_header = Headers} = ModData,
		["resourceInventoryManagement", "v1", "resource"], Query) ->
	do_response(ModData, Resource:get_resource_inventories(Query, Headers));
do_get(Resource, ModData, ["resourceInventoryManagement", "v1", "pla"], Query) ->
	do_response(ModData, Resource:get_pla(Query));
do_get(Resource, ModData, ["resourceInventory", "v1", "hub"], []) ->
	do_response(ModData, Resource:get_hubs());
do_get(Resource, ModData, ["resourceInventory", "v1", "hub", Id], []) ->
	do_response(ModData, Resource:get_hub(Id));
do_get(Resource, #mod{parsed_header = Headers} = ModData,
		["catalogManagement", "v2", "pla"], Query) ->
	do_response(ModData, Resource:get_plas(Query, Headers));
do_get(Resource, ModData, ["serviceCatalogManagement", "v2", "serviceSpecification"], Query) ->
	do_response(ModData, Resource:get_service_specs(Query));
do_get(Resource, ModData, ["productInventoryManagement", "v2", "product", Id], []) ->
	do_response(ModData, Resource:get_inventory(Id));
do_get(Resource, #mod{parsed_header = Headers} = ModData,
		["productInventoryManagement", "v2", "product"], Query) ->
	do_response(ModData, Resource:get_inventories(Query, Headers));
do_get(Resource, #mod{parsed_header = Headers} = ModData,
		["productInventoryManagement", "v2"], Query) ->
	do_response(ModData, Resource:get_inventories(Query, Headers));
do_get(Resource, ModData, ["productInventoryManagement", "schema", "OCS.yml"], []) ->
	do_response(ModData, Resource:get_schema());
do_get(Resource, ModData, ["productInventory", "v2", "hub"], []) ->
	do_response(ModData, Resource:get_product_hubs());
do_get(Resource, ModData, ["productInventory", "v2", "hub", Id], []) ->
	do_response(ModData, Resource:get_product_hub(Id));
do_get(Resource, #mod{parsed_header = Headers} = ModData,
		["serviceInventoryManagement", "v2", "service"], Query) ->
	do_response(ModData, Resource:get_inventories(Query, Headers));
do_get(Resource, #mod{parsed_header = Headers} = ModData,
		["serviceInventoryManagement", "v2"], Query) ->
	do_response(ModData, Resource:get_inventories(Query, Headers));
do_get(Resource, ModData, ["serviceInventoryManagement", "v2", "service", Id], []) ->
	do_response(ModData, Resource:get_inventory(Id));
do_get(Resource, ModData, ["serviceInventoryManagement", "schema", "OCS.yml"], []) ->
	do_response(ModData, Resource:get_schema());
do_get(Resource, ModData, ["serviceInventory", "v2", "hub"], []) ->
	do_response(ModData, Resource:get_hubs());
do_get(Resource, ModData, ["serviceInventory", "v2", "hub", Id], []) ->
	do_response(ModData, Resource:get_hub(Id));
do_get(_, #mod{data = Data} = _ModData, _, _) ->
	Response = "<h2>HTTP Error 404 - Not Found</h2>",
	{proceed, [{response, {404, Response}} | Data]}.

%% @hidden
do_response(#mod{data = Data} = ModData, {ok, Headers, ResponseBody}) ->
	Size = integer_to_list(iolist_size(ResponseBody)),
	NewHeaders = Headers ++ [{content_length, Size}],
	send(ModData, 200, NewHeaders, ResponseBody),
	{proceed,[{response,{already_sent, 200, Size}} | Data]};
do_response(#mod{data = Data} = _ModData, {error, 400}) ->
	Response = "<h2>HTTP Error 400 - Bad Request</h2>",
	{proceed, [{response, {400, Response}} | Data]};
do_response(#mod{data = Data} = _ModData, {error, 404}) ->
	Response = "<h2>HTTP Error 404 - Not Found</h2>",
	{proceed, [{response, {404, Response}} | Data]};
do_response(#mod{data = Data} = _ModData, {error, 412}) ->
	Response = "<h2>HTTP Error 412 - Precondition Failed</h2>",
	{proceed, [{response, {412, Response}} | Data]};
do_response(#mod{data = Data} = _ModData, {error, 416}) ->
	Response = "<h2>HTTP Error 416 - Range Not Satisfiable</h2>",
	{proceed, [{response, {416, Response}} | Data]};
do_response(#mod{data = Data} = _ModData, {error, 500}) ->
	Response = "<h2>HTTP Error 500 - Server Error</h2>",
	{proceed, [{response, {500, Response}} | Data]}.


%% @hidden
send(#mod{socket = Socket, socket_type = SocketType} = ModData,
		StatusCode, Headers, ResponseBody) ->
	httpd_response:send_header(ModData, StatusCode, Headers),
	httpd_socket:deliver(SocketType, Socket, ResponseBody).

