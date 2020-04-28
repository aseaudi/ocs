%% ocs_rest_res_resource.erl
%%% vim: ts=3
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%% @copyright 2016 - 2018 SigScale Global Inc.
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
-module(ocs_rest_res_resource).
-copyright('Copyright (c) 2016 - 2018 SigScale Global Inc.').

-export([content_types_accepted/0, content_types_provided/0]).
-export([get_resource_spec/1, get_resource_specs/1]).
-export([get_resource_category/1, get_resource_categories/1]).
-export([get_resource_candidate/1, get_resource_candidates/1]).
-export([get_resource_catalog/1, get_resource_catalogs/1]).
-export([get_resource_inventory/2, add_resource_inventory/2, patch_resource_inventory/4,
			delete_resource_inventory/2]).

-include("ocs.hrl").

%% support deprecated_time_unit()
-define(MILLISECOND, milli_seconds).
%-define(MILLISECOND, millisecond).

-define(specPath, "/catalogManagement/v2/resourceSpecification/").
-define(candidatePath, "/catalogManagement/v2/resourceCandidate/").
-define(catalogPath, "/catalogManagement/v2/resourceCatalog/").
-define(categoryPath, "/catalogManagement/v2/resourceCategory/").
-define(inventoryPath, "/resourceInventoryManagement/v1/logicalResource/").

-spec content_types_accepted() -> ContentTypes
	when
		ContentTypes :: list().
%% @doc Provides list of resource representations accepted.
content_types_accepted() ->
	["application/json", "application/json-patch+json"].

-spec content_types_provided() -> ContentTypes
	when
		ContentTypes :: list().
%% @doc Provides list of resource representations available.
content_types_provided() ->
	["application/json"].

-spec get_resource_spec(ID) -> Result
	when
		ID :: string(),
		Result :: {struct, [tuple()]} | {error, 404}.
%% @doc Get Resource Specification by ID.
get_resource_spec("1") ->
	ResourceSpec = tariff_table_spec(),
	Body = mochijson:encode(ResourceSpec),
	Headers = [{content_type, "application/json"}],
	{ok, Headers, Body};
get_resource_spec(_) ->
	{error, 404}.

-spec get_resource_specs(Query) -> Result when
	Query :: [{Key :: string(), Value :: string()}],
	Result	:: {ok, Headers, Body} | {error, Status},
	Headers	:: [tuple()],
	Body		:: iolist(),
	Status	:: 400 | 404 | 500.
%% @doc Respond to `GET /catalogManegment/v2/resourceSpecification'.
%% 	Retrieve all Resource specifications.
get_resource_specs([] = _Query) ->
	Headers = [{content_type, "application/json"}],
	Object = {array, [tariff_table_spec()]},
	Body = mochijson:encode(Object),
	{ok, Headers, Body};
get_resource_specs(_Query) ->
	{error, 400}.

-spec get_resource_category(ID) -> Result
	when
		ID :: string(),
		Result :: {struct, [tuple()]} | {error, 404}.
%% @doc Get Resource Category by ID.
get_resource_category("1") ->
	ResourceCatagory = tariff_table_category(),
	Body = mochijson:encode(ResourceCatagory),
	Headers = [{content_type, "application/json"}],
	{ok, Headers, Body};
get_resource_category(_) ->
	{error, 404}.

-spec get_resource_categories(Query) -> Result when
	Query :: [{Key :: string(), Value :: string()}],
	Result	:: {ok, Headers, Body} | {error, Status},
	Headers	:: [tuple()],
	Body		:: iolist(),
	Status	:: 400 | 404 | 500.
%% @doc Respond to `GET /catalogManegment/v2/resourceCategory'.
%% 	Retrieve all Resource categories.
get_resource_categories([] = _Query) ->
	Headers = [{content_type, "application/json"}],
	Object = {array, [tariff_table_category()]},
	Body = mochijson:encode(Object),
	{ok, Headers, Body};
get_resource_categories(_Query) ->
	{error, 400}.

-spec get_resource_candidate(ID) -> Result
	when
		ID :: string(),
		Result :: {struct, [tuple()]} | {error, 404}.
%% @doc Get Resource Candidate by ID.
get_resource_candidate("1") ->
	ResourceCandidate = tariff_table_candidate(),
	Body = mochijson:encode(ResourceCandidate),
	Headers = [{content_type, "application/json"}],
	{ok, Headers, Body};
get_resource_candidate(_) ->
	{error, 404}.

-spec get_resource_candidates(Query) -> Result when
	Query :: [{Key :: string(), Value :: string()}],
	Result	:: {ok, Headers, Body} | {error, Status},
	Headers	:: [tuple()],
	Body		:: iolist(),
	Status	:: 400 | 404 | 500.
%% @doc Respond to `GET /catalogManegment/v2/resourceCandidate'.
%% 	Retrieve all Resource candidate.
get_resource_candidates([] = _Query) ->
	Headers = [{content_type, "application/json"}],
	Object = {array, [tariff_table_candidate()]},
	Body = mochijson:encode(Object),
	{ok, Headers, Body};
get_resource_candidates(_Query) ->
	{error, 400}.

-spec get_resource_catalog(ID) -> Result
	when
		ID :: string(),
		Result :: {struct, [tuple()]} | {error, 404}.
%% @doc Get Resource Catalog by ID.
get_resource_catalog("1") ->
	ResourceCatalog = tariff_table_catalog(),
	Body = mochijson:encode(ResourceCatalog),
	Headers = [{content_type, "application/json"}],
	{ok, Headers, Body};
get_resource_catalog(_) ->
	{error, 404}.

-spec get_resource_catalogs(Query) -> Result when
	Query :: [{Key :: string(), Value :: string()}],
	Result	:: {ok, Headers, Body} | {error, Status},
	Headers	:: [tuple()],
	Body		:: iolist(),
	Status	:: 400 | 404 | 500.
%% @doc Respond to `GET /resourceCatalogManagement/v2'.
%% 	Retrieve all Resource catalogs.
get_resource_catalogs([] = _Query) ->
	Headers = [{content_type, "application/json"}],
	Object = {array, [tariff_table_catalog()]},
	Body = mochijson:encode(Object),
	{ok, Headers, Body};
get_resource_catalogs(_Query) ->
	{error, 400}.

-spec get_resource_inventory(Id, Query) -> Result when
	Id :: string(),
	Query :: [{Key :: string(), Value :: string()}],
	Result   :: {ok, Headers, Body} | {error, Status},
	Headers  :: [tuple()],
	Body     :: iolist(),
	Status   :: 400 | 404 | 500.
%% @doc Respond to `GET /resourceInventoryManagement/v1/logicalResource/{id}'.
%%    Retrieve all logical resource from inventory management.
get_resource_inventory(Id, [] = _Query) ->
	try
		Name = list_to_existing_atom(Id),
		case ocs:query_table(start, Name, undefined, undefined, undefined, undefined) of
			{eof, Page} ->
				L = get_resource_inventory1(Id, Page, []),
				Body = mochijson:encode({array, L}),
				Headers = [{content_type, "application/json"}],
				{ok, Headers, Body};
			{error, not_found} ->
				{error, 404};
			{error, _Reason} ->
				{error, 500}
		end
	catch
		error:badarg ->
			{error, 404};
		_:_Reason1 ->
			{error, 500}
	end.
get_resource_inventory1(Id, [#gtt{num = Prefix, value = Value} | T], Acc) ->
		Gtt = gtt(Id, {Prefix, element(1, Value), element(2, Value)}),
		get_resource_inventory1(Id, T, [Gtt | Acc]);
get_resource_inventory1(_, [], Acc) ->
		lists:reverse(Acc).

-spec add_resource_inventory(Table, ReqData) -> Result when
	Table :: string(),
	ReqData :: [tuple()],
	Result   :: {ok, Headers, Body} | {error, Status},
	Headers  :: [tuple()],
	Body     :: iolist(),
	Status   :: 400 | 500 .
%% @doc Respond to
%% 	`POST /resourceInventoryManagement/v1/logicalResource/{table}'.
%%    Add a new row in logical resource inventory management.
add_resource_inventory(Table, ReqData) ->
	try
		{P, D, R} = gtt(Table, mochijson:decode(ReqData)),
		Name = list_to_existing_atom(Table),
		case catch ocs_gtt:insert(Name, P, {D, R}) of
			{ok, #gtt{num = Prefix1, value = Value}} ->
				{Prefix1, element(1, Value),
						element(2, Value), element(size(Value), Value)};
			{'EXIT', {no_exists, _}} ->
				throw(not_found);
			{'EXIT', Reason} ->
				throw(Reason)
		end
	of
		{Prefix2, Desc, Rate, LM} ->
			Body = mochijson:encode(gtt(Table, {Prefix2, Desc, Rate})),
			Etag = ocs_rest:etag(LM),
			Headers = [{content_type, "application/json"}, {etag, Etag}],
			{ok, Headers, Body}
	catch
		throw:not_found ->
			{error, 404};
		throw:_Reason1 ->
			{error, 500};
		error:badarg ->
			{error, 400};
		_:_ ->
			{error, 400}
	end.

-spec patch_resource_inventory(Table, Id, Etag, ReqData) -> Result
	when
		Table :: string(),
		Id	:: string(),
		Etag	:: undefined | list(),
		ReqData	:: [tuple()],
		Result	:: {ok, Headers, Body} | {error, Status},
		Headers	:: [tuple()],
		Body		:: iolist(),
		Status	:: 400 | 404 | 500 .
%% @doc Respond to `PATCH /resourceInventoryManagement/v1/logicalResource/{table}/{id}'.
%% 	Update a table row using JSON patch method
patch_resource_inventory(Table, Id, _Etag, ReqData) ->
	try
		Table1 = list_to_existing_atom(Table),
		{Table1, mochijson:decode(ReqData)}
	of
		{Table2, Operations} ->
			case catch ocs_gtt:lookup_last(Table2, Id) of
				{'EXIT', _} ->
					throw(not_found);
				V1 ->
					case catch ocs_rest:patch(Operations,
							gtt(Table, {Id, element(1, V1), element(2, V1)})) of
						{struct, _} = Res  ->
							{Id, Description, Rate} = gtt(Id, Res),
							{ok, #gtt{value = V}} = ocs_gtt:insert(Table2, Id, {Description, Rate}),
							Location = ?inventoryPath ++ Table ++ Id,
							Headers = [{location, Location},
									{etag, ocs_rest:etag(element(size(V), V))}],
							Body = mochijson:encode(Res),
							{ok, Headers, Body};
						_ ->
							throw(bad_request)
					end
			end
	catch
		throw:not_found ->
			{error, 404};
		throw:bad_request ->
			{error, 400};
		_:_ ->
			{error, 500}
	end.

-spec delete_resource_inventory(Table, Id) -> Result
   when
		Table :: string(),
      Id :: string(),
      Result :: {ok, Headers :: [tuple()], Body :: iolist()}
            | {error, ErrorCode :: integer()} .
%% @doc Respond to `DELETE /resourceInventoryManagement/v1/logicalResource/{table}/{id}''
%%    request to remove a `Table row'.
delete_resource_inventory(Table, Id) ->
	try
		Name = list_to_existing_atom(Table),
		ocs_gtt:delete(Name, Id)
	of
		ok ->
			{ok, [], []}
	catch
		error:badarg ->
			{error, 404};
		_:_ ->
			{error, 400}
	end.

%%----------------------------------------------------------------------
%%  internal functions
%%----------------------------------------------------------------------

%% @hidden
tariff_table_spec() ->
	Id = {"id", "1"},
	Href = {"href", ?specPath "1"},
	Name = {"name", "TariffTableSpec"},
	Description = {"description", "Voice call rating tariff table"},
	Status = {"lifecycleStatus", "Active"},
	Version = {"version", "1.0"},
	LastUpdate = {"lastUpdate", "2018-01-10"},
	Category = {"category", "TariffTable"},
	Chars = {array, [{struct, [{"name", "prefix"},
			{"description", "Call address prefix"},
			{"valueType", "MatrixCharacteristicSpec"},
			{"resourceSpecCharacteristicValue", {array, [{struct, 
			[{"seqNum", 1}, {"valueType", "String"}]}]}}]},
			{struct, [{"name", "description"},
			{"description", "Prefix description"},
			{"valueType", "MatrixCharacteristicSpec"},
			{"resourceSpecCharacteristicValue", {array, [{struct, 
			[{"seqNum", 2}, {"valueType", "String"}]}]}}]},
			{struct, [{"name", "rate"},
			{"description", "Rated price for address"},
			{"valueType", "MatrixCharacteristicSpec"},
			{"resourceSpecCharacteristicValue", {array, [{struct, 
			[{"seqNum", 3}, {"valueType", "Number"}]}]}}]}]},
	Characteristic = {"resourceSpecCharacteristic" , Chars},
	{struct, [Id, Href, Name, Description, Version, Status, LastUpdate, Category, Characteristic]}.

%% @hidden
tariff_table_category() ->
	Id = {"id", "1"},
	Href = {"href", ?categoryPath "1"},
	Name = {"name", "TariffTableCategory"},
	Description = {"description", "Voice call rating tariff tables"},
	Version = {"version", "1.0"},
	LastUpdate = {"lastUpdate", "2018-01-10"},
	Status = {"lifecycleStatus", "Active"},
	IsRoot = {"isRoot", true},
	Candidate = {"resourceCandidate", {array, [{struct, [{"id", "1"}, {"href", ?candidatePath "1"},
			{"version", "1.0"}, {"name", "TariffTableCandidate"}]}]}}, 
	{struct, [Id, Href, Name, Description, Version, Status, LastUpdate, IsRoot, Candidate]}.

%% @hidden
tariff_table_candidate() ->
	Id = {"id", "1"},
	Href = {"href", ?candidatePath "1"},
	Name = {"name", "TariffTableCandidate"},
	Description = {"description", "Voice call rating tariff table"},
	Version = {"version", "1.0"},
	LastUpdate = {"lastUpdate", "2018-01-10"},
	Status = {"lifecycleStatus", "Active"},
	Category = {"category", {array, [{struct, [{"id", "1"}, {"href", ?categoryPath "1"},
			{"version", "1.0"}, {"name", "TariffTableCandidate"}]}]}},
	ResourceSpec = {"resourceSpecification", {struct, [{"id", "1"}, {"href", ?specPath "1"},
			{"name", "TariffTableSpec"}]}},
	{struct, [Id, Href, Name, Description, Version, Status, LastUpdate, Category, ResourceSpec]}.

%% @hidden
tariff_table_catalog() ->
	Id = {"id", "1"},
	Href = {"href", ?catalogPath "1"},
	Name = {"name", "TariffTableCatalog"},
	Description = {"description", "Voice call rating tariff table"},
	Version = {"version", "1.0"},
	LastUpdate = {"lastUpdate", "2018-01-10"},
	Status = {"lifecycleStatus", "Active"},
	Category = {"category", {array, [{struct, [{"id", "1"}, {"href", ?categoryPath "1"},
		{"version", "1.0"}, {"name", "TariffTableCategory"}]}]}},
	{struct, [Id, Href, Name, Description, Version, Status, LastUpdate, Category]}.

-spec gtt(Name, Gtt) -> Gtt
	when
		Name :: string(),
		Gtt :: {Prefix, Description, Rate} | {struct, [tuple()]},
		Prefix :: string(),
		Description :: string(),
		Rate :: non_neg_integer().
%% @doc CODEC for gtt.
%% @private
gtt(Name, {Prefix, Description, Rate} = _Gtt) ->
		{struct, [{"id", Prefix}, {"href", ?inventoryPath ++ Name ++ "/" ++ Prefix},
			{"resourceCharacteristic", {array, [{struct, [{"name", "prefix"},
			{"value", {struct, [{"seqNum", 1}, {"value", Prefix}]}}]},
			{struct, [{"name", "description"},
			{"value", {struct, [{"seqNum", 2}, {"value", Description}]}}]},
			{struct, [{"name", "rate"},
			{"value", {struct, [{"seqNum", 3}, {"value", ocs_rest:millionths_out(Rate)}]}}]}]}}]};
gtt(_, {struct, ObjectMembers}) when is_list(ObjectMembers) ->
	gtt1(ObjectMembers, {undefined, [], undefined}).
%% @hidden
gtt1([{"resourceCharacteristic", {array, L}} | T], Acc) ->
   gtt1(T, gtt2(L, Acc));
gtt1([_ | T], Acc) ->
	gtt1(T, Acc);
gtt1([], {Prefix, Desc, Rate} = _Acc)
		when is_list(Prefix)->
   {Prefix, Desc, ocs_rest:millionths_in(Rate)}.
%% @hidden
gtt2([{struct, L} | T], {Prefix, Desc, Rate} = _Acc) ->
	case lists:keytake("name", 1, L) of
		{value, {"name", "prefix"}, L1} ->
			{_, {struct, L2}} = lists:keyfind("value", 1, L1),
			{_, Prefix1} = lists:keyfind("value", 1, L2),
			gtt2(T, {Prefix1, Desc, Rate});
		{value, {"name", "description"}, L1} ->
			{_, {struct, L2}} = lists:keyfind("value", 1, L1),
			{_, Desc1} = lists:keyfind("value", 1, L2),
			gtt2(T, {Prefix, Desc1, Rate});
		{value, {"name", "rate"}, L1} ->
			{_, {struct, L2}} = lists:keyfind("value", 1, L1),
			{_, Rate1} = lists:keyfind("value", 1, L2), 
			gtt2(T, {Prefix, Desc, Rate1})
	end;
gtt2([], Acc) ->
	Acc.

