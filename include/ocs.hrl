%%% ocs.hrl
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
%%% 

-type offer_status() :: in_study | in_design | in_test
		| active | rejected | launched | retired | obsolete.
-type product_status() :: created | pending_active | aborted
		| cancelled | active | suspended | pending_terminate | terminated.

%% define price types
-type product_price_type() :: recurring | one_time | usage.

%% define unit of measure
-type unit_of_measure() :: octets| cents | seconds.

%% define recurring charge period
-type recur_period() :: daily | weekly | monthly | yearly.

%% define client table entries record
-record(client,
		{address :: inet:ip_address() | undefined,
		identifier = <<>> :: binary(),
		port :: inet:port_number() | undefined,
		protocol :: radius | diameter | undefined,
		secret :: binary() | undefined,
		last_modified :: tuple() | undefined}).

-record(alteration,
		{name :: string() | undefined,
		description :: string() | undefined,
		start_date :: pos_integer() | undefined,
		end_date :: pos_integer() | undefined,
		type :: product_price_type() | undefined,
		period :: recur_period() | undefined,
		units :: unit_of_measure() | undefined,
		size :: integer() | undefined,
		amount :: integer() | undefined,
		currency :: string() | undefined}).

-record(char_value,
		{default :: boolean() | undefined,
		units :: string() | undefined,
		start_date :: pos_integer() | undefined,
		end_date :: pos_integer() | undefined,
		value :: term() | undefined,
		from :: term() | undefined,
		to :: term() | undefined,
		type :: string() | undefined, % Number | String | Boolean | DateTime | ...
		interval :: open | closed | closed_bottom | closed_top | undefined,
		regex :: {CompiledRegEx :: re:mp(), OriginalRegEx :: string()} | undefined}).

-record(char_value_use,
		{name :: string() | undefined,
		description :: string() | undefined,
		type :: string() | undefined, % Number | String | Boolean | DateTime | ...
		min :: non_neg_integer() | undefined,
		max :: pos_integer() | undefined,
		start_date :: pos_integer() | undefined,
		end_date :: pos_integer() | undefined,
		values = [] :: [#char_value{}]}).

-record(price,
		{name :: string() | undefined,
		description :: string() | undefined,
		start_date :: pos_integer() | undefined,
		end_date :: pos_integer() | undefined,
		type :: product_price_type() | undefined,
		period :: recur_period() | undefined,
		units :: unit_of_measure() | undefined,
		size :: integer() | undefined,
		amount :: integer() | undefined,
		currency :: string() | undefined,
		char_value_use = [] :: [#char_value_use{}],
		alteration :: #alteration{} | undefined}).

-record(product,
		{name :: '_' | string() | undefined,
		description :: '_' | string() | undefined,
		start_date :: '_' | pos_integer() | undefined,
		end_date :: '_' | pos_integer() | undefined,
		is_bundle = false :: '_' | boolean() | undefined,
		status :: offer_status() | '_' | undefined,
		specification :: '_' | string() | undefined,
		price :: '_' | [#price{}] | undefined,
		char_value_use = [] :: [#char_value_use{}],
		last_modified :: tuple() | '_' | undefined}).

-record(bucket,
		{id :: string() | undefined,
		name :: string() | undefined,
		start_date :: pos_integer() | undefined,
		termination_date :: pos_integer() | undefined,
		remain_amount = 0 :: integer(),
		reservations = [] :: [{TS :: pos_integer(),
				Amount :: pos_integer(),
				SessionId :: string() | binary()}],
		units :: octets | cents | seconds | undefined,
		last_modified :: tuple() | undefined}).

-record(product_instance,
		{product :: string(),
		start_date :: pos_integer(),
		termination_date :: pos_integer(),
		status :: product_status(),
		characteristics = [] :: [{Name :: string(), Value :: term()}],
		last_modified :: tuple() |  undefined}).

%% define subscriber table entries record
-record(subscriber,
		{name :: binary(),
		password :: binary(),
		attributes :: radius_attributes:attributes(),
		buckets :: [#bucket{}],
		product :: #product_instance{},
		enabled = true :: boolean(),
		disconnect  = false :: boolean(),
		session_attributes = [] :: [{pos_integer(), radius_attributes:attributes()}],
		multisession = false :: boolean(),
		last_modified :: tuple() | undefined}).

