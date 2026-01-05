--
-- PostgreSQL database dump
--

\restrict nuax3hFvIaOouA2W4OFE6rqJaFyPJ3j9pPhrPuVpcbq9B7vemJoC4eBMM9G5yIw

-- Dumped from database version 18.1 (Debian 18.1-1.pgdg12+2)
-- Dumped by pg_dump version 18.1 (Debian 18.1-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: ncsdb_5zem_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO ncsdb_5zem_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: ncsdb_5zem_user
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: CallLog; Type: TABLE; Schema: public; Owner: ncsdb_5zem_user
--

CREATE TABLE public."CallLog" (
    id integer NOT NULL,
    "leadId" integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    description text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."CallLog" OWNER TO ncsdb_5zem_user;

--
-- Name: CallLog_id_seq; Type: SEQUENCE; Schema: public; Owner: ncsdb_5zem_user
--

CREATE SEQUENCE public."CallLog_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CallLog_id_seq" OWNER TO ncsdb_5zem_user;

--
-- Name: CallLog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ncsdb_5zem_user
--

ALTER SEQUENCE public."CallLog_id_seq" OWNED BY public."CallLog".id;


--
-- Name: FollowUpHistory; Type: TABLE; Schema: public; Owner: ncsdb_5zem_user
--

CREATE TABLE public."FollowUpHistory" (
    id integer NOT NULL,
    description text NOT NULL,
    notes text,
    status text NOT NULL,
    priority text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "leadId" integer NOT NULL
);


ALTER TABLE public."FollowUpHistory" OWNER TO ncsdb_5zem_user;

--
-- Name: FollowUpHistory_id_seq; Type: SEQUENCE; Schema: public; Owner: ncsdb_5zem_user
--

CREATE SEQUENCE public."FollowUpHistory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."FollowUpHistory_id_seq" OWNER TO ncsdb_5zem_user;

--
-- Name: FollowUpHistory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ncsdb_5zem_user
--

ALTER SEQUENCE public."FollowUpHistory_id_seq" OWNED BY public."FollowUpHistory".id;


--
-- Name: Lead; Type: TABLE; Schema: public; Owner: ncsdb_5zem_user
--

CREATE TABLE public."Lead" (
    id integer NOT NULL,
    "leadName" text DEFAULT ''::text NOT NULL,
    "companyName" text NOT NULL,
    email text NOT NULL,
    "contactPerson" text NOT NULL,
    phone text NOT NULL,
    assignee text NOT NULL,
    priority text NOT NULL,
    status text NOT NULL,
    "leadSource" text DEFAULT ''::text NOT NULL,
    notes text,
    "nextFollowUpDate" timestamp(3) without time zone,
    "followUpTime" timestamp(3) without time zone,
    service text DEFAULT ''::text NOT NULL,
    location text
);


ALTER TABLE public."Lead" OWNER TO ncsdb_5zem_user;

--
-- Name: Lead_id_seq; Type: SEQUENCE; Schema: public; Owner: ncsdb_5zem_user
--

CREATE SEQUENCE public."Lead_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Lead_id_seq" OWNER TO ncsdb_5zem_user;

--
-- Name: Lead_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ncsdb_5zem_user
--

ALTER SEQUENCE public."Lead_id_seq" OWNED BY public."Lead".id;


--
-- Name: Role; Type: TABLE; Schema: public; Owner: ncsdb_5zem_user
--

CREATE TABLE public."Role" (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."Role" OWNER TO ncsdb_5zem_user;

--
-- Name: Role_id_seq; Type: SEQUENCE; Schema: public; Owner: ncsdb_5zem_user
--

CREATE SEQUENCE public."Role_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Role_id_seq" OWNER TO ncsdb_5zem_user;

--
-- Name: Role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ncsdb_5zem_user
--

ALTER SEQUENCE public."Role_id_seq" OWNED BY public."Role".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: ncsdb_5zem_user
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    phone text NOT NULL,
    role text NOT NULL,
    department text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "joinDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "leadsAssigned" integer DEFAULT 0,
    "leadsConverted" integer DEFAULT 0
);


ALTER TABLE public."User" OWNER TO ncsdb_5zem_user;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: ncsdb_5zem_user
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO ncsdb_5zem_user;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ncsdb_5zem_user
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: ncsdb_5zem_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO ncsdb_5zem_user;

--
-- Name: CallLog id; Type: DEFAULT; Schema: public; Owner: ncsdb_5zem_user
--

ALTER TABLE ONLY public."CallLog" ALTER COLUMN id SET DEFAULT nextval('public."CallLog_id_seq"'::regclass);


--
-- Name: FollowUpHistory id; Type: DEFAULT; Schema: public; Owner: ncsdb_5zem_user
--

ALTER TABLE ONLY public."FollowUpHistory" ALTER COLUMN id SET DEFAULT nextval('public."FollowUpHistory_id_seq"'::regclass);


--
-- Name: Lead id; Type: DEFAULT; Schema: public; Owner: ncsdb_5zem_user
--

ALTER TABLE ONLY public."Lead" ALTER COLUMN id SET DEFAULT nextval('public."Lead_id_seq"'::regclass);


--
-- Name: Role id; Type: DEFAULT; Schema: public; Owner: ncsdb_5zem_user
--

ALTER TABLE ONLY public."Role" ALTER COLUMN id SET DEFAULT nextval('public."Role_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: ncsdb_5zem_user
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: CallLog; Type: TABLE DATA; Schema: public; Owner: ncsdb_5zem_user
--

COPY public."CallLog" (id, "leadId", name, email, phone, description, "createdAt") FROM stdin;
\.


--
-- Data for Name: FollowUpHistory; Type: TABLE DATA; Schema: public; Owner: ncsdb_5zem_user
--

COPY public."FollowUpHistory" (id, description, notes, status, priority, "createdAt", "leadId") FROM stdin;
2	Updated lead. Status: new, Priority: medium. Task: Web Development	\N	new	medium	2025-09-11 11:48:52.154	2
3	Updated lead. Status: new, Priority: medium. Task: Web Development	Shared Nucleosys Tech profile for client understanding, and also discussion with call on 12 Sep 11 am regarding enquiry references for the Cubuilt company also. 	new	medium	2025-09-12 06:08:48.748	3
4	Updated lead. Status: new, Priority: medium. Task: Mobile App	Call discussion client location visit with Dipak (discussion on call)	new	medium	2025-09-12 06:32:06.178	4
5	Updated lead. Status: new, Priority: medium. Task: Mobile App	Call discussion client location visit with Dipak (discussion on call)	new	medium	2025-09-12 06:32:06.278	5
6	Updated lead. Status: new, Priority: medium. Task: Web Development	WhatsApp message 	new	medium	2025-09-12 09:43:30.879	6
7	Updated lead. Status: new, Priority: medium. Task: Marketing	\N	new	medium	2025-09-15 10:54:44.37	7
8	Updated lead. Status: new, Priority: medium. Task: Marketing	details send on whatapp number 	new	medium	2025-09-15 10:54:44.489	8
10	Updated lead. Status: contacted, Priority: medium. Task: Web Development	WhatsApp message - E-commerce website \n1. Bulk enquiry\n2. Enquiry form\n3. Product Tagging\n4. Categorisation\n5. Payment (Razorpay) + Courier (Bluedart/Delhivery, etc.) integration\n6. Guest login and payment\n7. Customer Reviews for products, and a post-order review form for experience\n8. Weekly mails to registered users for new products/updates\n9. Terms and Conditions acceptance before ordering\n10. Search bar suggestions\n11. Fast buffering\n12. Our trending/HOT products on the homepage\n13. Wishlist/Favorites\n14. Reminder for abandoned cart\n15. Social Media integration\n16. Reorder option\n17. Auto Address Fill(chrome history) while filling registration\n18. Order history\n19. Edit Account\n20. Admin side – Enable/Disable Auto Print Invoice on receiving orders\n21. Admin side – Voice notification on receiving order (Mail and Website)\n22. Employee side – Undisclosed purchase rates and profit margin	contacted	medium	2025-09-15 11:37:11.601	6
11	Updated lead. Status: contacted, Priority: medium. Task: Web Development	WhatsApp message - E-commerce website \n1. Bulk enquiry\n2. Enquiry form\n3. Product Tagging\n4. Categorisation\n5. Payment (Razorpay) + Courier (Bluedart/Delhivery, etc.) integration\n6. Guest login and payment\n7. Customer Reviews for products, and a post-order review form for experience\n8. Weekly mails to registered users for new products/updates\n9. Terms and Conditions acceptance before ordering\n10. Search bar suggestions\n11. Fast buffering\n12. Our trending/HOT products on the homepage\n13. Wishlist/Favorites\n14. Reminder for abandoned cart\n15. Social Media integration\n16. Reorder option\n17. Auto Address Fill(chrome history) while filling registration\n18. Order history\n19. Edit Account\n20. Admin side – Enable/Disable Auto Print Invoice on receiving orders\n21. Admin side – Voice notification on receiving order (Mail and Website)\n22. Employee side – Undisclosed purchase rates and profit margin	contacted	medium	2025-09-15 11:38:16.986	6
12	Updated lead. Status: new, Priority: medium. Task: Marketing	Visit pending confirmation on the call 	new	medium	2025-09-15 13:12:51.266	10
13	Updated lead. Status: qualified, Priority: medium. Task: Mobile App	Client visit done (17 Sep). Required DEMO - Pending.	qualified	medium	2025-09-17 13:10:32.803	5
14	Updated lead. Status: qualified, Priority: medium. Task: Mobile App	Client visit done (17 Sep). Required DEMO - Pending.	qualified	medium	2025-09-17 13:10:44.606	5
15	Updated lead. Status: qualified, Priority: medium. Task: Mobile App	Client visit done (17 Sep). Required DEMO - Pending.\n\n19 Sep 2.30 Google meeting – Demo	qualified	medium	2025-09-18 09:11:52.869	5
16	Updated lead. Status: new, Priority: medium. Task: Web Development	Discussion is pending. 	new	medium	2025-09-19 08:36:46.48	11
17	Updated lead. Status: new, Priority: medium. Task: Web Development	Discussion is pending. 	new	medium	2025-09-19 08:39:21.754	11
18	Updated lead. Status: new, Priority: medium. Task: Web Development	Discussion is pending. 	new	medium	2025-09-19 12:42:22.463	11
19	Updated lead. Status: new, Priority: medium. Task: Web Development	Calling with Dipak -5pm 20 Sep send details client side	new	medium	2025-09-20 05:44:57.235	12
20	Updated lead. Status: new, Priority: medium. Task: Marketing	Nill	new	medium	2025-09-20 13:57:09.664	13
21	Updated lead. Status: new, Priority: medium. Task: Marketing	Shruti	new	medium	2025-09-22 11:16:30.626	13
22	Updated lead. Status: proposal, Priority: medium. Task: 	The proposal was shared (today, 5 pm meeting for discussion).	proposal	medium	2025-09-22 11:18:25.501	14
23	Updated lead. Status: proposal, Priority: medium. Task: Web Development	Calling with Dipak -5pm 20 Sep send details client side	proposal	medium	2025-09-22 11:19:23.038	12
24	Updated lead. Status: new, Priority: medium. Task: Web Development	 I am going to start an artificial jewellery brand and I need shopify website.Shared Profile 	new	medium	2025-09-24 09:42:23.782	15
25	Updated lead. Status: proposal, Priority: medium. Task: General Follow-up	Busy car lunching events pending some process follow-up, 26 Sep.                                             The proposal was shared (today, 5 pm meeting for discussion).	proposal	medium	2025-09-25 08:54:26.687	14
26	Updated lead. Status: proposal, Priority: medium. Task: General Follow-up	Busy car lunching events pending some process follow-up, 26 Sep.                                             The proposal was shared (today, 5 pm meeting for discussion).	proposal	medium	2025-09-25 08:54:40.214	14
27	Updated lead. Status: proposal, Priority: medium. Task: General Follow-up	Busy car lunching events pending some process follow-up, 26 Sep.                                             The proposal was shared (today, 5 pm meeting for discussion).	proposal	medium	2025-09-25 08:54:51.218	14
28	Updated lead. Status: qualified, Priority: medium. Task: Mobile App	\n\n\n   \nCalled on 29 Sep - said preparing draft to send later. Client visit done (17 Sep). Required DEMO - Pending.\n\n19 Sep 2.30 Google meeting – Demo\n	qualified	medium	2025-09-29 08:40:43.05	5
29	Updated lead. Status: qualified, Priority: medium. Task: Mobile App	\n\n\n   \nCalled on 29 Sep - said preparing draft to send later. Client visit done (17 Sep). Required DEMO - Pending.\n\n19 Sep 2.30 Google meeting – Demo\n	qualified	medium	2025-09-29 08:40:43.191	5
30	Updated lead. Status: qualified, Priority: medium. Task: Mobile App	\n\n\n   \nCalled on 29 Sep - said preparing draft to send later. Client visit done (17 Sep). Required DEMO - Pending.\n\n19 Sep 2.30 Google meeting – Demo\n	qualified	medium	2025-09-29 08:40:43.386	5
31	Updated lead. Status: qualified, Priority: medium. Task: Mobile App	\n\n\n   \nCalled on 29 Sep - said preparing draft to send later. Client visit done (17 Sep). Required DEMO - Pending.\n\n19 Sep 2.30 Google meeting – Demo\n	qualified	medium	2025-09-29 08:40:43.483	5
32	Updated lead. Status: qualified, Priority: medium. Task: Mobile App	\n\n\n   \nCalled on 29 Sep - said preparing draft to send later. Client visit done (17 Sep). Required DEMO - Pending.\n\n19 Sep 2.30 Google meeting – Demo\n	qualified	medium	2025-09-29 08:40:43.485	5
33	Updated lead. Status: qualified, Priority: medium. Task: Mobile App	\n\n\n   \nCalled on 29 Sep - said preparing draft to send later. Client visit done (17 Sep). Required DEMO - Pending.\n\n19 Sep 2.30 Google meeting – Demo\n	qualified	medium	2025-09-29 08:40:43.486	5
34	Updated lead. Status: qualified, Priority: medium. Task: Mobile App	\n\n\n   \nCalled on 29 Sep - said preparing draft to send later. Client visit done (17 Sep). Required DEMO - Pending.\n\n19 Sep 2.30 Google meeting – Demo\n	qualified	medium	2025-09-29 08:40:43.488	5
35	Updated lead. Status: qualified, Priority: medium. Task: Mobile App	\nCalled on 29 Sep - said preparing draft to send later. Client visit done (17 Sep). Required DEMO - Pending.\n\n19 Sep 2.30 Google meeting – Demo\n	qualified	medium	2025-09-29 08:40:58.329	5
36	Updated lead. Status: new, Priority: medium. Task: Marketing		new	medium	2025-09-29 08:43:55.449	7
37	Updated lead. Status: contacted, Priority: medium. Task: Web Development	 	contacted	medium	2025-09-29 09:21:05.877	6
38	Updated lead. Status: contacted, Priority: medium. Task: Web Development	 Friday 26 Sep -Visit Done \n30 sep conformation 	contacted	medium	2025-09-29 09:22:10.984	6
39	Updated lead. Status: contacted, Priority: medium. Task: Web Development	1st  Oct shared quotation \n Friday 26 Sep -Visit Done \n30 sep conformation 	contacted	medium	2025-10-01 12:24:20.261	6
40	Updated lead. Status: new, Priority: medium. Task: Web Development	1st Oct shared Quotation\nShared Nucleosys Tech profile for client understanding, and also discussion with call on 12 Sep 11 am regarding enquiry references for the Cubuilt company. 	new	medium	2025-10-01 12:25:43.589	3
41	Updated lead. Status: contacted, Priority: medium. Task: Web Development	14 Oct - WooCommerce - proposal shared - pending \n\n1st  Oct shared quotation \n Friday 26 Sep -Visit Done \n30 sep conformation 	contacted	medium	2025-10-14 06:41:17.541	6
42	Updated lead. Status: proposal, Priority: high. Task: SEO	Shopify proposal pending, and the previous proposal has been revised. \n13 Oct office visit \nRevise the proposal pending discussion on the process	proposal	high	2025-10-14 06:56:03.631	16
43	Updated lead. Status: proposal, Priority: high. Task: SEO	Shopify proposal pending, and the previous proposal has been revised. \n13 Oct office visit \nRevise the proposal pending discussion on the process	proposal	high	2025-10-14 06:56:37.851	16
45	Updated lead. Status: new, Priority: medium. Task: Web Development	Hold on some work 	new	medium	2025-10-14 13:28:22.39	18
46	Updated lead. Status: won, Priority: medium. Task: Web Development	Waiting for PO. \n\n1st Oct shared Quotation\nShared Nucleosys Tech profile for client understanding, and also discussion with call on 12 Sep 11 am regarding enquiry references for the Cubuilt company. 	won	medium	2025-10-16 06:18:21.599	3
47	Updated lead. Status: won, Priority: medium. Task: Web Development	Started website work \n\n\nWaiting for PO. \n\n1st Oct shared Quotation\nShared Nucleosys Tech profile for client understanding, and also discussion with call on 12 Sep 11 am regarding enquiry references for the Cubuilt company. 	won	medium	2025-11-03 04:48:00.148	3
48	Updated lead. Status: proposal, Priority: high. Task: SEO	Discussion with Piyush - 3 Nov visit 4 pm discussion on proposal.\n\nShopify proposal pending, and the previous proposal has been revised. \n13 Oct office visit \nRevise the proposal pending discussion on the process	proposal	high	2025-11-03 04:49:16.814	16
49	Updated lead. Status: new, Priority: medium. Task: Web Development	Shared details on WhatsApp	new	medium	2025-11-03 05:19:42.123	19
50	Updated lead. Status: contacted, Priority: medium. Task: Web Development	Call or follow up 16,17 Dec .\n\n14 Oct - WooCommerce - proposal shared - pending \n\n1st  Oct shared quotation \n Friday 26 Sep -Visit Done \n30 sep conformation 	contacted	medium	2025-11-12 05:45:21.502	6
51	Updated lead. Status: qualified, Priority: medium. Task: Mobile App	Call on 12 Nov  as per the call discussion .\n\nCalled on 29 Sep - said preparing draft to send later. Client visit done (17 Sep). Required DEMO - Pending.\n\n19 Sep 2.30 Google meeting – Demo\n	qualified	medium	2025-11-12 05:46:40.612	5
52	Updated lead. Status: new, Priority: medium. Task: Web Development	Proposal pending 	new	medium	2025-11-15 11:15:37.419	20
76	Updated lead. Status: new, Priority: medium. Task: Web Development	Questions sent for website design	new	medium	2025-11-24 07:10:44.588	44
77	Updated lead. Status: new, Priority: medium. Task: UI/UX Design	4 Dec Shared proposal	new	medium	2025-12-04 09:36:50.891	45
78	Updated lead. Status: new, Priority: medium. Task: UI/UX Design	4 Dec Shared proposal -Done proposal 	new	medium	2025-12-04 13:12:52.633	45
79	Updated lead. Status: qualified, Priority: medium. Task: Mobile App	Shared 3 Dec NDA \nCall on 12 Nov  as per the call discussion .\n\nCalled on 29 Sep - said preparing draft to send later. Client visit done (17 Sep). Required DEMO - Pending.\n\n19 Sep 2.30 Google meeting – Demo\n	qualified	medium	2025-12-04 13:14:32.841	5
80	Updated lead. Status: new, Priority: medium. Task: UI/UX Design	4 Dec Shared proposal -Done proposal  \n\n\none dairy product proposal pending	new	medium	2025-12-04 13:15:41.755	45
81	Updated lead. Status: proposal, Priority: high. Task: Web Development	website 	proposal	high	2025-12-19 08:59:47.963	46
82	Updated lead. Status: contacted, Priority: low. Task: Web Development	Website and SEO 	contacted	low	2025-12-19 13:14:47.454	47
\.


--
-- Data for Name: Lead; Type: TABLE DATA; Schema: public; Owner: ncsdb_5zem_user
--

COPY public."Lead" (id, "leadName", "companyName", email, "contactPerson", phone, assignee, priority, status, "leadSource", notes, "nextFollowUpDate", "followUpTime", service, location) FROM stdin;
2	Romel Sir	Ador 	gdipakh@gmail.com	Romel Sir	09097569714		medium	new	Website	\N	2025-09-14 00:00:00	2025-09-14 10:18:00	Web Development	India
4	Application Development	synise	tusharb@synise.com	Tushar 	7499157621	Shruti 	medium	new	Cold Call	Call discussion client location visit with Dipak (discussion on call)	2025-09-15 00:00:00	2025-09-15 11:00:00	Mobile App	Karve Nager Pune 
8	website and digital marketing discussion 	Sumangalam Food & Beverages	sumanglamfoods2019@gmail.com	NA	9697896972	Shruti 	medium	new	Cold Call	details send on whatapp number 	2025-09-19 00:00:00	2025-09-19 10:00:00	Marketing	Jambhukwadi
10	 social_media_marketing_	Insent stick manufacturer, He need distributers.	NA	 Vikas Pachore	9767993999	Shruti 	medium	new	Cold Call	Visit pending confirmation on the call 	2025-09-16 00:00:00	2025-09-16 10:00:00	Marketing	Bhosari
14	Maruti Suzuki showroom	Maruti Suzuki showroom	mohsinshaikh3d@gmail.com	Maruti Suzuki showroom	9372236999	Shruti 	medium	proposal	Email Campaign	Busy car lunching events pending some process follow-up, 26 Sep.                                             The proposal was shared (today, 5 pm meeting for discussion).	2025-09-26 00:00:00	2025-12-19 09:00:00	General Follow-up	Mumbai 
7	Sumangalam Food & Beverages	Sumangalam Food & Beverages	sumanglamfoods2019@gmail.com	Sumangalam Food & Beverages	9697896972	Shruti 	medium	new	Cold Call		2025-09-19 00:00:00	2025-12-12 09:00:00	Marketing	Jambhukwadi
11	Website Designing	NA	mohsinshaikh3d@gmail.com	NA	9372236999	Shruti 	medium	new	Email Campaign	Discussion is pending. 	2025-09-20 00:00:00	2025-09-20 22:30:00	Web Development	Pune
13	NA	NA	NA	NA	9403623234	Shruti 	medium	new	Cold Call	Shruti	2025-09-22 00:00:00	2025-12-15 09:00:00	Marketing	NA
12	Maruti Suzuki showroom	Maruti Suzuki showroom	mohsinshaikh3d@gmail.com	Maruti Suzuki showroom	9372236999	Shruti 	medium	proposal	Email Campaign	Calling with Dipak -5pm 20 Sep send details client side	2025-09-23 00:00:00	2025-12-16 09:00:00	Web Development	Mumbai 
15	E-Commerce Website	NA	Indieglowglam@gmail.com	Yashkumar Madgulwar	8275979816	Shruti 	medium	new	Website	 I am going to start an artificial jewellery brand and I need shopify website.Shared Profile 	2025-09-25 00:00:00	2025-09-25 10:30:00	Web Development	NA
18	ERP	Catrobotics	Na	NA	NA	Shruti 	medium	new	Other	Hold on some work 	2025-10-15 00:00:00	2025-10-15 10:00:00	Web Development	Pune
3	Toolfab . wind tower manufacturers in Tamilnadu and karnataka 	Toolfab . wind tower manufacturers in Tamilnadu and karnataka 	sagayam@toolfab.in	Toolfab . wind tower manufacturers in Tamilnadu and karnataka 	 9842907771	Shruti 	medium	won	Website	Started website work \n\n\nWaiting for PO. \n\n1st Oct shared Quotation\nShared Nucleosys Tech profile for client understanding, and also discussion with call on 12 Sep 11 am regarding enquiry references for the Cubuilt company. 	2025-09-15 00:00:00	2025-12-08 09:29:00	Web Development	 Tamilnadu and karnataka 
16	LIFLIC	LIFLIC	digitalmedia@sunconengineers.com / piyushsaoji13@gmail.com	LIFLIC	75886 90022	Shruti 	high	proposal	Website	Discussion with Piyush - 3 Nov visit 4 pm discussion on proposal.\n\nShopify proposal pending, and the previous proposal has been revised. \n13 Oct office visit \nRevise the proposal pending discussion on the process	2025-10-15 00:00:00	2026-01-07 10:00:00	SEO	\N
19	Website Design  	Protect Financial Solutions	protectfinancialsolutions@gmail.com	 Rajkumar	 9970644155	Shruti 	medium	new	Website	Shared details on WhatsApp	2025-11-04 00:00:00	2025-11-04 10:30:00	Web Development	Warje
6	Sagar Electronics (soldron)	Sagar Electronics (soldron)	NA	Sagar Electronics (soldron)	+91 95117 07701	Shruti 	medium	contacted	Social Media	Call or follow up 16,17 Dec .\n\n14 Oct - WooCommerce - proposal shared - pending \n\n1st  Oct shared quotation \n Friday 26 Sep -Visit Done \n30 sep conformation 	2025-09-22 00:00:00	2025-12-15 09:00:00	Web Development	NA
20	Website Redesign  	Icantraininginstitute	support@icantraininginstitute.com	Sagar	+91 98816 36771	Shruti 	medium	new	Other	Proposal pending 	2025-11-17 00:00:00	2025-11-17 10:00:00	Web Development	Pune
5	synise	synise	tusharb@synise.com	synise	7499157621	Shruti 	medium	qualified	Cold Call	Shared 3 Dec NDA \nCall on 12 Nov  as per the call discussion .\n\nCalled on 29 Sep - said preparing draft to send later. Client visit done (17 Sep). Required DEMO - Pending.\n\n19 Sep 2.30 Google meeting – Demo\n	2025-11-13 00:00:00	2026-02-05 09:20:00	Mobile App	Karve Nager Pune 
44	Website Design  	Centpro(www.centpro.com)	hr@centpro.com	Sneha	+91 99230 11679	Shruti 	medium	new	Other	Questions sent for website design	2025-11-25 00:00:00	2025-11-25 10:45:00	Web Development	Hadapsar,bhosari
45	ORYVA Digital Flagship Store	ORYVA Digital Flagship Store	saurabh@oryva.in	ORYVA Digital Flagship Store	NA	Shruti 	medium	new	Other	4 Dec Shared proposal -Done proposal  \n\n\none dairy product proposal pending	2025-12-04 00:00:00	2026-02-26 10:06:00	UI/UX Design	\N
46	Doctor Website 	Dr Amit Nale	kk@ctr.com	Dr Amit Nale	+91 90285 56828	Shruti 	high	proposal	Website	website 	2025-12-22 00:00:00	2025-12-22 10:28:00	Web Development	India
47	School -5 -12 	Manish 	NA	Manish 	+91 81498 55488		low	contacted	Cold Call	Website and SEO 	2025-12-22 00:00:00	2025-12-22 10:46:00	Web Development	Satara
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: ncsdb_5zem_user
--

COPY public."Role" (id, name) FROM stdin;
2	Admin
3	Employee
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: ncsdb_5zem_user
--

COPY public."User" (id, name, email, password, phone, role, department, "updatedAt", "createdAt", status, "joinDate", "leadsAssigned", "leadsConverted") FROM stdin;
1	Vaibhav	Vaibhav@gmail.com	$2b$10$NaLjiltv8Q/L/sq2WELnQ.cBcEbn6DqYqFRRoXuK2Qk8eVYoOTjxe	9999999999	Admin	Admin	2025-09-11 09:19:54.859	2025-09-11 09:19:54.859	active	2025-09-11 09:19:54.859	0	0
4	Shruti 	hr@nucleosystech.in	$2b$10$ClUxTvFL5M1qT6wavfnoXuqMCC8cAdM3/K.ycskLa2d/diFSKb6ra	8866064	Employee	Sales	2025-09-11 11:53:51.251	2025-09-11 11:53:51.251	active	2025-09-11 11:53:51.251	0	0
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: ncsdb_5zem_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
2d49cf1f-f3d3-4fa6-a567-544249422cf7	d0c64067fb09ea9212faace6d0d25b5dd9710691d78fdd6f5d012b55027aa6f4	2025-09-11 09:14:43.711102+00	20250910125247_init	\N	\N	2025-09-11 09:14:42.439814+00	1
\.


--
-- Name: CallLog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ncsdb_5zem_user
--

SELECT pg_catalog.setval('public."CallLog_id_seq"', 1, false);


--
-- Name: FollowUpHistory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ncsdb_5zem_user
--

SELECT pg_catalog.setval('public."FollowUpHistory_id_seq"', 82, true);


--
-- Name: Lead_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ncsdb_5zem_user
--

SELECT pg_catalog.setval('public."Lead_id_seq"', 47, true);


--
-- Name: Role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ncsdb_5zem_user
--

SELECT pg_catalog.setval('public."Role_id_seq"', 3, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ncsdb_5zem_user
--

SELECT pg_catalog.setval('public."User_id_seq"', 4, true);


--
-- Name: CallLog CallLog_pkey; Type: CONSTRAINT; Schema: public; Owner: ncsdb_5zem_user
--

ALTER TABLE ONLY public."CallLog"
    ADD CONSTRAINT "CallLog_pkey" PRIMARY KEY (id);


--
-- Name: FollowUpHistory FollowUpHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: ncsdb_5zem_user
--

ALTER TABLE ONLY public."FollowUpHistory"
    ADD CONSTRAINT "FollowUpHistory_pkey" PRIMARY KEY (id);


--
-- Name: Lead Lead_pkey; Type: CONSTRAINT; Schema: public; Owner: ncsdb_5zem_user
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: ncsdb_5zem_user
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: ncsdb_5zem_user
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: ncsdb_5zem_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: ncsdb_5zem_user
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: CallLog CallLog_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ncsdb_5zem_user
--

ALTER TABLE ONLY public."CallLog"
    ADD CONSTRAINT "CallLog_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FollowUpHistory FollowUpHistory_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ncsdb_5zem_user
--

ALTER TABLE ONLY public."FollowUpHistory"
    ADD CONSTRAINT "FollowUpHistory_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: ncsdb_5zem_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO ncsdb_5zem_user;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO ncsdb_5zem_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO ncsdb_5zem_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO ncsdb_5zem_user;


--
-- PostgreSQL database dump complete
--

\unrestrict nuax3hFvIaOouA2W4OFE6rqJaFyPJ3j9pPhrPuVpcbq9B7vemJoC4eBMM9G5yIw

