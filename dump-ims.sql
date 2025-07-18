PGDMP                      }            ims    17.4 (Debian 17.4-1.pgdg120+2)    17.0 �    :           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            ;           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            <           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            =           1262    16384    ims    DATABASE     n   CREATE DATABASE ims WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
    DROP DATABASE ims;
                     ims    false                        2615    33035    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
                     ims    false            >           0    0    SCHEMA public    ACL     +   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
                        ims    false    6            �           1247    33332    enum_student_fees_status    TYPE     t   CREATE TYPE public.enum_student_fees_status AS ENUM (
    'PAID',
    'WAIVED_OFF',
    'PENDING',
    'OVERDUE'
);
 +   DROP TYPE public.enum_student_fees_status;
       public               ims    false    6            �           1247    33320 !   enum_transaction_transaction_type    TYPE     �   CREATE TYPE public.enum_transaction_transaction_type AS ENUM (
    'SALARY',
    'FEES',
    'INCOME',
    'EXPENSE',
    'OTHER'
);
 4   DROP TYPE public.enum_transaction_transaction_type;
       public               ims    false    6            �           1247    33309    enum_user_user_type    TYPE     s   CREATE TYPE public.enum_user_user_type AS ENUM (
    'ADMIN',
    'STUDENT',
    'TUTOR',
    'NA',
    'STAFF'
);
 &   DROP TYPE public.enum_user_user_type;
       public               ims    false    6            �           1247    33098    fees_status    TYPE     g   CREATE TYPE public.fees_status AS ENUM (
    'PAID',
    'WAIVED_OFF',
    'PENDING',
    'OVERDUE'
);
    DROP TYPE public.fees_status;
       public               ims    false    6            �           1247    33086    transaction_type    TYPE     t   CREATE TYPE public.transaction_type AS ENUM (
    'SALARY',
    'FEES',
    'INCOME',
    'EXPENSE',
    'OTHER'
);
 #   DROP TYPE public.transaction_type;
       public               ims    false    6            �           1247    33074 	   user_type    TYPE     i   CREATE TYPE public.user_type AS ENUM (
    'STUDENT',
    'TUTOR',
    'ADMIN',
    'STAFF',
    'NA'
);
    DROP TYPE public.user_type;
       public               ims    false    6            �            1259    33248    chatroom    TABLE     1  CREATE TABLE public.chatroom (
    id integer NOT NULL,
    user_id integer NOT NULL,
    message character varying(2000) NOT NULL,
    subjecttutorid integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.chatroom;
       public         heap r       ims    false    6            �            1259    33247    chatroom_id_seq    SEQUENCE     �   CREATE SEQUENCE public.chatroom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.chatroom_id_seq;
       public               ims    false    6    237            ?           0    0    chatroom_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.chatroom_id_seq OWNED BY public.chatroom.id;
          public               ims    false    236            �            1259    33192 	   classroom    TABLE       CREATE TABLE public.classroom (
    id integer NOT NULL,
    capacity integer DEFAULT 10 NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.classroom;
       public         heap r       ims    false    6            �            1259    33191    classroom_id_seq    SEQUENCE     �   CREATE SEQUENCE public.classroom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.classroom_id_seq;
       public               ims    false    6    231            @           0    0    classroom_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.classroom_id_seq OWNED BY public.classroom.id;
          public               ims    false    230            �            1259    41590    goals    TABLE     �  CREATE TABLE public.goals (
    id integer NOT NULL,
    studentid integer NOT NULL,
    subjecttutorid integer NOT NULL,
    goaltitle character varying(255) NOT NULL,
    targetdate date NOT NULL,
    progress double precision DEFAULT 0,
    streak integer DEFAULT 0,
    status character varying(255) NOT NULL,
    lastprogressupdate date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
    DROP TABLE public.goals;
       public         heap r       ims    false    6            �            1259    41589    goals_id_seq    SEQUENCE     �   CREATE SEQUENCE public.goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.goals_id_seq;
       public               ims    false    6    247            A           0    0    goals_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.goals_id_seq OWNED BY public.goals.id;
          public               ims    false    246            �            1259    33181    grade    TABLE     �   CREATE TABLE public.grade (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.grade;
       public         heap r       ims    false    6            �            1259    33180    grade_id_seq    SEQUENCE     �   CREATE SEQUENCE public.grade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.grade_id_seq;
       public               ims    false    6    229            B           0    0    grade_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.grade_id_seq OWNED BY public.grade.id;
          public               ims    false    228            �            1259    41550    notes    TABLE       CREATE TABLE public.notes (
    id integer NOT NULL,
    studentid integer NOT NULL,
    subjecttutorid integer NOT NULL,
    subject character varying(255) NOT NULL,
    chapter character varying(255) NOT NULL,
    heading character varying(255) NOT NULL,
    note character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    points numeric(255,0) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.notes;
       public         heap r       ims    false    6            �            1259    41549    notes_id_seq    SEQUENCE     �   CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.notes_id_seq;
       public               ims    false    245    6            C           0    0    notes_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;
          public               ims    false    244            �            1259    33138    staff    TABLE     f  CREATE TABLE public.staff (
    id integer NOT NULL,
    user_id integer,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    firstname character varying(255) NOT NULL,
    lastname character varying(255) NOT NULL,
    "position" character varying(255) NOT NULL,
    contact character varying(255) NOT NULL,
    salary integer DEFAULT 10 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.staff;
       public         heap r       ims    false    6            �            1259    33137    staff_id_seq    SEQUENCE     �   CREATE SEQUENCE public.staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.staff_id_seq;
       public               ims    false    6    223            D           0    0    staff_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.staff_id_seq OWNED BY public.staff.id;
          public               ims    false    222            �            1259    33108    student    TABLE       CREATE TABLE public.student (
    id integer NOT NULL,
    user_id integer,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    firstname character varying(255) NOT NULL,
    lastname character varying(255) NOT NULL,
    contact character varying(255) NOT NULL,
    grade character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.student;
       public         heap r       ims    false    6            �            1259    33293    student_fees    TABLE     �  CREATE TABLE public.student_fees (
    id integer NOT NULL,
    studentid integer NOT NULL,
    month character varying(255) NOT NULL,
    year integer NOT NULL,
    totalamount double precision NOT NULL,
    status public.fees_status DEFAULT 'PENDING'::public.fees_status NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
     DROP TABLE public.student_fees;
       public         heap r       ims    false    920    6    920            �            1259    33292    student_fees_id_seq    SEQUENCE     �   CREATE SEQUENCE public.student_fees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.student_fees_id_seq;
       public               ims    false    6    243            E           0    0    student_fees_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.student_fees_id_seq OWNED BY public.student_fees.id;
          public               ims    false    242            �            1259    33107    student_id_seq    SEQUENCE     �   CREATE SEQUENCE public.student_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.student_id_seq;
       public               ims    false    6    219            F           0    0    student_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.student_id_seq OWNED BY public.student.id;
          public               ims    false    218            �            1259    33229    student_subject    TABLE     9  CREATE TABLE public.student_subject (
    id integer NOT NULL,
    studentid integer NOT NULL,
    subjecttutorid integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true NOT NULL
);
 #   DROP TABLE public.student_subject;
       public         heap r       ims    false    6            �            1259    33228    student_subject_id_seq    SEQUENCE     �   CREATE SEQUENCE public.student_subject_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.student_subject_id_seq;
       public               ims    false    6    235            G           0    0    student_subject_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.student_subject_id_seq OWNED BY public.student_subject.id;
          public               ims    false    234            �            1259    33169    subject    TABLE     9  CREATE TABLE public.subject (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT subject_name_check CHECK (((name)::text = upper((name)::text)))
);
    DROP TABLE public.subject;
       public         heap r       ims    false    6            �            1259    33168    subject_id_seq    SEQUENCE     �   CREATE SEQUENCE public.subject_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.subject_id_seq;
       public               ims    false    6    227            H           0    0    subject_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.subject_id_seq OWNED BY public.subject.id;
          public               ims    false    226            �            1259    33204    subject_tutor    TABLE     G  CREATE TABLE public.subject_tutor (
    id integer NOT NULL,
    subjectid integer NOT NULL,
    tutorid integer NOT NULL,
    gradeid integer NOT NULL,
    fees integer DEFAULT 10 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
 !   DROP TABLE public.subject_tutor;
       public         heap r       ims    false    6            �            1259    33203    subject_tutor_id_seq    SEQUENCE     �   CREATE SEQUENCE public.subject_tutor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.subject_tutor_id_seq;
       public               ims    false    6    233            I           0    0    subject_tutor_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.subject_tutor_id_seq OWNED BY public.subject_tutor.id;
          public               ims    false    232            �            1259    33277 	   timetable    TABLE     �  CREATE TABLE public.timetable (
    id integer NOT NULL,
    timeslot character varying(255) NOT NULL,
    timeslotid character varying(255) NOT NULL,
    classroomid integer NOT NULL,
    monday integer,
    tuesday integer,
    wednesday integer,
    thursday integer,
    friday integer,
    saturday integer,
    sunday integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.timetable;
       public         heap r       ims    false    6            �            1259    33276    timetable_id_seq    SEQUENCE     �   CREATE SEQUENCE public.timetable_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.timetable_id_seq;
       public               ims    false    241    6            J           0    0    timetable_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.timetable_id_seq OWNED BY public.timetable.id;
          public               ims    false    240            �            1259    33269    transaction    TABLE     }  CREATE TABLE public.transaction (
    id integer NOT NULL,
    transaction_type public.transaction_type DEFAULT 'OTHER'::public.transaction_type NOT NULL,
    amount integer NOT NULL,
    description character varying(255) NOT NULL,
    user_id integer NOT NULL,
    participant_id integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);
    DROP TABLE public.transaction;
       public         heap r       ims    false    917    917    6            �            1259    33268    transaction_id_seq    SEQUENCE     �   CREATE SEQUENCE public.transaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.transaction_id_seq;
       public               ims    false    239    6            K           0    0    transaction_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.transaction_id_seq OWNED BY public.transaction.id;
          public               ims    false    238            �            1259    33123    tutor    TABLE       CREATE TABLE public.tutor (
    id integer NOT NULL,
    user_id integer,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    firstname character varying(255) NOT NULL,
    lastname character varying(255) NOT NULL,
    contact character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.tutor;
       public         heap r       ims    false    6            �            1259    33122    tutor_id_seq    SEQUENCE     �   CREATE SEQUENCE public.tutor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.tutor_id_seq;
       public               ims    false    6    221            L           0    0    tutor_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.tutor_id_seq OWNED BY public.tutor.id;
          public               ims    false    220            �            1259    41638    tutor_payments    TABLE     �  CREATE TABLE public.tutor_payments (
    id integer NOT NULL,
    tutorid integer NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    totalpayment numeric(10,2) NOT NULL,
    received numeric(10,2) NOT NULL,
    receiveddate date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
 "   DROP TABLE public.tutor_payments;
       public         heap r       ims    false    6            �            1259    41637    tutor_payments_id_seq    SEQUENCE     �   CREATE SEQUENCE public.tutor_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.tutor_payments_id_seq;
       public               ims    false    249    6            M           0    0    tutor_payments_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.tutor_payments_id_seq OWNED BY public.tutor_payments.id;
          public               ims    false    248            �            1259    33154    user    TABLE     �  CREATE TABLE public."user" (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    user_type public.user_type DEFAULT 'NA'::public.user_type NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public."user";
       public         heap r       ims    false    914    914    6            �            1259    33153    user_id_seq    SEQUENCE     �   CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.user_id_seq;
       public               ims    false    225    6            N           0    0    user_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;
          public               ims    false    224            -           2604    33251    chatroom id    DEFAULT     j   ALTER TABLE ONLY public.chatroom ALTER COLUMN id SET DEFAULT nextval('public.chatroom_id_seq'::regclass);
 :   ALTER TABLE public.chatroom ALTER COLUMN id DROP DEFAULT;
       public               ims    false    236    237    237            !           2604    33195    classroom id    DEFAULT     l   ALTER TABLE ONLY public.classroom ALTER COLUMN id SET DEFAULT nextval('public.classroom_id_seq'::regclass);
 ;   ALTER TABLE public.classroom ALTER COLUMN id DROP DEFAULT;
       public               ims    false    231    230    231            <           2604    41593    goals id    DEFAULT     d   ALTER TABLE ONLY public.goals ALTER COLUMN id SET DEFAULT nextval('public.goals_id_seq'::regclass);
 7   ALTER TABLE public.goals ALTER COLUMN id DROP DEFAULT;
       public               ims    false    247    246    247                       2604    33184    grade id    DEFAULT     d   ALTER TABLE ONLY public.grade ALTER COLUMN id SET DEFAULT nextval('public.grade_id_seq'::regclass);
 7   ALTER TABLE public.grade ALTER COLUMN id DROP DEFAULT;
       public               ims    false    228    229    229            9           2604    41553    notes id    DEFAULT     d   ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);
 7   ALTER TABLE public.notes ALTER COLUMN id DROP DEFAULT;
       public               ims    false    244    245    245                       2604    33141    staff id    DEFAULT     d   ALTER TABLE ONLY public.staff ALTER COLUMN id SET DEFAULT nextval('public.staff_id_seq'::regclass);
 7   ALTER TABLE public.staff ALTER COLUMN id DROP DEFAULT;
       public               ims    false    222    223    223                       2604    33111 
   student id    DEFAULT     h   ALTER TABLE ONLY public.student ALTER COLUMN id SET DEFAULT nextval('public.student_id_seq'::regclass);
 9   ALTER TABLE public.student ALTER COLUMN id DROP DEFAULT;
       public               ims    false    219    218    219            5           2604    33296    student_fees id    DEFAULT     r   ALTER TABLE ONLY public.student_fees ALTER COLUMN id SET DEFAULT nextval('public.student_fees_id_seq'::regclass);
 >   ALTER TABLE public.student_fees ALTER COLUMN id DROP DEFAULT;
       public               ims    false    242    243    243            )           2604    33232    student_subject id    DEFAULT     x   ALTER TABLE ONLY public.student_subject ALTER COLUMN id SET DEFAULT nextval('public.student_subject_id_seq'::regclass);
 A   ALTER TABLE public.student_subject ALTER COLUMN id DROP DEFAULT;
       public               ims    false    235    234    235                       2604    33172 
   subject id    DEFAULT     h   ALTER TABLE ONLY public.subject ALTER COLUMN id SET DEFAULT nextval('public.subject_id_seq'::regclass);
 9   ALTER TABLE public.subject ALTER COLUMN id DROP DEFAULT;
       public               ims    false    227    226    227            %           2604    33207    subject_tutor id    DEFAULT     t   ALTER TABLE ONLY public.subject_tutor ALTER COLUMN id SET DEFAULT nextval('public.subject_tutor_id_seq'::regclass);
 ?   ALTER TABLE public.subject_tutor ALTER COLUMN id DROP DEFAULT;
       public               ims    false    232    233    233            2           2604    33280    timetable id    DEFAULT     l   ALTER TABLE ONLY public.timetable ALTER COLUMN id SET DEFAULT nextval('public.timetable_id_seq'::regclass);
 ;   ALTER TABLE public.timetable ALTER COLUMN id DROP DEFAULT;
       public               ims    false    241    240    241            0           2604    33272    transaction id    DEFAULT     p   ALTER TABLE ONLY public.transaction ALTER COLUMN id SET DEFAULT nextval('public.transaction_id_seq'::regclass);
 =   ALTER TABLE public.transaction ALTER COLUMN id DROP DEFAULT;
       public               ims    false    239    238    239                       2604    33126    tutor id    DEFAULT     d   ALTER TABLE ONLY public.tutor ALTER COLUMN id SET DEFAULT nextval('public.tutor_id_seq'::regclass);
 7   ALTER TABLE public.tutor ALTER COLUMN id DROP DEFAULT;
       public               ims    false    220    221    221            A           2604    41641    tutor_payments id    DEFAULT     v   ALTER TABLE ONLY public.tutor_payments ALTER COLUMN id SET DEFAULT nextval('public.tutor_payments_id_seq'::regclass);
 @   ALTER TABLE public.tutor_payments ALTER COLUMN id DROP DEFAULT;
       public               ims    false    248    249    249                       2604    33157    user id    DEFAULT     d   ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);
 8   ALTER TABLE public."user" ALTER COLUMN id DROP DEFAULT;
       public               ims    false    224    225    225            +          0    33248    chatroom 
   TABLE DATA           `   COPY public.chatroom (id, user_id, message, subjecttutorid, created_at, updated_at) FROM stdin;
    public               ims    false    237   �       %          0    33192 	   classroom 
   TABLE DATA           O   COPY public.classroom (id, capacity, name, created_at, updated_at) FROM stdin;
    public               ims    false    231   I�       5          0    41590    goals 
   TABLE DATA           �   COPY public.goals (id, studentid, subjecttutorid, goaltitle, targetdate, progress, streak, status, lastprogressupdate, created_at, updated_at) FROM stdin;
    public               ims    false    247   �       #          0    33181    grade 
   TABLE DATA           A   COPY public.grade (id, name, created_at, updated_at) FROM stdin;
    public               ims    false    229   8�       3          0    41550    notes 
   TABLE DATA           �   COPY public.notes (id, studentid, subjecttutorid, subject, chapter, heading, note, status, points, created_at, updated_at) FROM stdin;
    public               ims    false    245   ��                 0    33138    staff 
   TABLE DATA           �   COPY public.staff (id, user_id, username, email, password, title, firstname, lastname, "position", contact, salary, created_at, updated_at) FROM stdin;
    public               ims    false    223   q�                 0    33108    student 
   TABLE DATA           �   COPY public.student (id, user_id, username, email, password, firstname, lastname, contact, grade, created_at, updated_at) FROM stdin;
    public               ims    false    219   ��       1          0    33293    student_fees 
   TABLE DATA           o   COPY public.student_fees (id, studentid, month, year, totalamount, status, created_at, updated_at) FROM stdin;
    public               ims    false    243   /�       )          0    33229    student_subject 
   TABLE DATA           k   COPY public.student_subject (id, studentid, subjecttutorid, created_at, updated_at, is_active) FROM stdin;
    public               ims    false    235   ��       !          0    33169    subject 
   TABLE DATA           C   COPY public.subject (id, name, created_at, updated_at) FROM stdin;
    public               ims    false    227   �       '          0    33204    subject_tutor 
   TABLE DATA           f   COPY public.subject_tutor (id, subjectid, tutorid, gradeid, fees, created_at, updated_at) FROM stdin;
    public               ims    false    233   ��       /          0    33277 	   timetable 
   TABLE DATA           �   COPY public.timetable (id, timeslot, timeslotid, classroomid, monday, tuesday, wednesday, thursday, friday, saturday, sunday, created_at, updated_at) FROM stdin;
    public               ims    false    241   E�       -          0    33269    transaction 
   TABLE DATA           �   COPY public.transaction (id, transaction_type, amount, description, user_id, participant_id, created_at, updated_at) FROM stdin;
    public               ims    false    239   ��                 0    33123    tutor 
   TABLE DATA           �   COPY public.tutor (id, user_id, username, email, password, title, firstname, lastname, contact, created_at, updated_at) FROM stdin;
    public               ims    false    221   v�       7          0    41638    tutor_payments 
   TABLE DATA           �   COPY public.tutor_payments (id, tutorid, month, year, totalpayment, received, receiveddate, created_at, updated_at) FROM stdin;
    public               ims    false    249   ��                 0    33154    user 
   TABLE DATA           m   COPY public."user" (id, username, email, password, user_type, is_active, created_at, updated_at) FROM stdin;
    public               ims    false    225   �       O           0    0    chatroom_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.chatroom_id_seq', 27, true);
          public               ims    false    236            P           0    0    classroom_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.classroom_id_seq', 7, true);
          public               ims    false    230            Q           0    0    goals_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.goals_id_seq', 1, true);
          public               ims    false    246            R           0    0    grade_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.grade_id_seq', 5, true);
          public               ims    false    228            S           0    0    notes_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.notes_id_seq', 5, true);
          public               ims    false    244            T           0    0    staff_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.staff_id_seq', 6, true);
          public               ims    false    222            U           0    0    student_fees_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.student_fees_id_seq', 2, true);
          public               ims    false    242            V           0    0    student_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.student_id_seq', 24, true);
          public               ims    false    218            W           0    0    student_subject_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.student_subject_id_seq', 9, true);
          public               ims    false    234            X           0    0    subject_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.subject_id_seq', 5, true);
          public               ims    false    226            Y           0    0    subject_tutor_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.subject_tutor_id_seq', 10, true);
          public               ims    false    232            Z           0    0    timetable_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.timetable_id_seq', 21, true);
          public               ims    false    240            [           0    0    transaction_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.transaction_id_seq', 5, true);
          public               ims    false    238            \           0    0    tutor_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.tutor_id_seq', 6, true);
          public               ims    false    220            ]           0    0    tutor_payments_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.tutor_payments_id_seq', 2, true);
          public               ims    false    248            ^           0    0    user_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.user_id_seq', 25, true);
          public               ims    false    224            l           2606    33257    chatroom chatroom_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.chatroom
    ADD CONSTRAINT chatroom_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.chatroom DROP CONSTRAINT chatroom_pkey;
       public                 ims    false    237            d           2606    33202    classroom classroom_name_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.classroom
    ADD CONSTRAINT classroom_name_key UNIQUE (name);
 F   ALTER TABLE ONLY public.classroom DROP CONSTRAINT classroom_name_key;
       public                 ims    false    231            f           2606    33200    classroom classroom_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.classroom
    ADD CONSTRAINT classroom_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.classroom DROP CONSTRAINT classroom_pkey;
       public                 ims    false    231            v           2606    41601    goals goals_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.goals DROP CONSTRAINT goals_pkey;
       public                 ims    false    247            `           2606    33190    grade grade_name_key 
   CONSTRAINT     O   ALTER TABLE ONLY public.grade
    ADD CONSTRAINT grade_name_key UNIQUE (name);
 >   ALTER TABLE ONLY public.grade DROP CONSTRAINT grade_name_key;
       public                 ims    false    229            b           2606    33188    grade grade_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.grade
    ADD CONSTRAINT grade_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.grade DROP CONSTRAINT grade_pkey;
       public                 ims    false    229            t           2606    41559    notes notes_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.notes DROP CONSTRAINT notes_pkey;
       public                 ims    false    245            R           2606    33152    staff staff_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.staff DROP CONSTRAINT staff_email_key;
       public                 ims    false    223            T           2606    33148    staff staff_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.staff DROP CONSTRAINT staff_pkey;
       public                 ims    false    223            V           2606    33150    staff staff_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.staff DROP CONSTRAINT staff_username_key;
       public                 ims    false    223            F           2606    33121    student student_email_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_email_key UNIQUE (email);
 C   ALTER TABLE ONLY public.student DROP CONSTRAINT student_email_key;
       public                 ims    false    219            r           2606    33301    student_fees student_fees_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.student_fees
    ADD CONSTRAINT student_fees_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.student_fees DROP CONSTRAINT student_fees_pkey;
       public                 ims    false    243            H           2606    33117    student student_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.student DROP CONSTRAINT student_pkey;
       public                 ims    false    219            j           2606    33236 $   student_subject student_subject_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.student_subject
    ADD CONSTRAINT student_subject_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.student_subject DROP CONSTRAINT student_subject_pkey;
       public                 ims    false    235            J           2606    33119    student student_username_key 
   CONSTRAINT     [   ALTER TABLE ONLY public.student
    ADD CONSTRAINT student_username_key UNIQUE (username);
 F   ALTER TABLE ONLY public.student DROP CONSTRAINT student_username_key;
       public                 ims    false    219            \           2606    33179    subject subject_name_key 
   CONSTRAINT     S   ALTER TABLE ONLY public.subject
    ADD CONSTRAINT subject_name_key UNIQUE (name);
 B   ALTER TABLE ONLY public.subject DROP CONSTRAINT subject_name_key;
       public                 ims    false    227            ^           2606    33177    subject subject_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.subject
    ADD CONSTRAINT subject_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.subject DROP CONSTRAINT subject_pkey;
       public                 ims    false    227            h           2606    33212     subject_tutor subject_tutor_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.subject_tutor
    ADD CONSTRAINT subject_tutor_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.subject_tutor DROP CONSTRAINT subject_tutor_pkey;
       public                 ims    false    233            p           2606    33286    timetable timetable_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT timetable_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.timetable DROP CONSTRAINT timetable_pkey;
       public                 ims    false    241            n           2606    33275    transaction transaction_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.transaction DROP CONSTRAINT transaction_pkey;
       public                 ims    false    239            L           2606    33136    tutor tutor_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.tutor
    ADD CONSTRAINT tutor_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.tutor DROP CONSTRAINT tutor_email_key;
       public                 ims    false    221            x           2606    41645 "   tutor_payments tutor_payments_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.tutor_payments
    ADD CONSTRAINT tutor_payments_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.tutor_payments DROP CONSTRAINT tutor_payments_pkey;
       public                 ims    false    249            N           2606    33132    tutor tutor_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.tutor
    ADD CONSTRAINT tutor_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.tutor DROP CONSTRAINT tutor_pkey;
       public                 ims    false    221            P           2606    33134    tutor tutor_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.tutor
    ADD CONSTRAINT tutor_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.tutor DROP CONSTRAINT tutor_username_key;
       public                 ims    false    221            X           2606    33167    user user_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public."user" DROP CONSTRAINT user_email_key;
       public                 ims    false    225            Z           2606    33165    user user_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public."user" DROP CONSTRAINT user_pkey;
       public                 ims    false    225            ~           2606    33258 %   chatroom chatroom_subjecttutorid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.chatroom
    ADD CONSTRAINT chatroom_subjecttutorid_fkey FOREIGN KEY (subjecttutorid) REFERENCES public.subject_tutor(id) ON UPDATE CASCADE ON DELETE CASCADE;
 O   ALTER TABLE ONLY public.chatroom DROP CONSTRAINT chatroom_subjecttutorid_fkey;
       public               ims    false    233    237    3432                       2606    33263    chatroom chatroom_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.chatroom
    ADD CONSTRAINT chatroom_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.student(id) ON UPDATE CASCADE ON DELETE CASCADE;
 H   ALTER TABLE ONLY public.chatroom DROP CONSTRAINT chatroom_user_id_fkey;
       public               ims    false    237    3400    219            �           2606    41602    goals goals_studentid_fkey    FK CONSTRAINT     }   ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_studentid_fkey FOREIGN KEY (studentid) REFERENCES public.student(id);
 D   ALTER TABLE ONLY public.goals DROP CONSTRAINT goals_studentid_fkey;
       public               ims    false    3400    219    247            �           2606    41607    goals goals_subjecttutorid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_subjecttutorid_fkey FOREIGN KEY (subjecttutorid) REFERENCES public.subject_tutor(id);
 I   ALTER TABLE ONLY public.goals DROP CONSTRAINT goals_subjecttutorid_fkey;
       public               ims    false    233    247    3432            �           2606    41560    notes notes_studentid_fkey    FK CONSTRAINT     }   ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_studentid_fkey FOREIGN KEY (studentid) REFERENCES public.student(id);
 D   ALTER TABLE ONLY public.notes DROP CONSTRAINT notes_studentid_fkey;
       public               ims    false    3400    219    245            �           2606    41565    notes notes_subjecttutorid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_subjecttutorid_fkey FOREIGN KEY (subjecttutorid) REFERENCES public.subject_tutor(id);
 I   ALTER TABLE ONLY public.notes DROP CONSTRAINT notes_subjecttutorid_fkey;
       public               ims    false    245    233    3432            �           2606    33302 (   student_fees student_fees_studentid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.student_fees
    ADD CONSTRAINT student_fees_studentid_fkey FOREIGN KEY (studentid) REFERENCES public.student(id);
 R   ALTER TABLE ONLY public.student_fees DROP CONSTRAINT student_fees_studentid_fkey;
       public               ims    false    243    3400    219            |           2606    33242 .   student_subject student_subject_studentid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.student_subject
    ADD CONSTRAINT student_subject_studentid_fkey FOREIGN KEY (studentid) REFERENCES public.student(id) ON UPDATE CASCADE ON DELETE CASCADE;
 X   ALTER TABLE ONLY public.student_subject DROP CONSTRAINT student_subject_studentid_fkey;
       public               ims    false    219    3400    235            }           2606    33237 3   student_subject student_subject_subjecttutorid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.student_subject
    ADD CONSTRAINT student_subject_subjecttutorid_fkey FOREIGN KEY (subjecttutorid) REFERENCES public.subject(id) ON UPDATE CASCADE ON DELETE CASCADE;
 ]   ALTER TABLE ONLY public.student_subject DROP CONSTRAINT student_subject_subjecttutorid_fkey;
       public               ims    false    227    3422    235            y           2606    33223 (   subject_tutor subject_tutor_gradeid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.subject_tutor
    ADD CONSTRAINT subject_tutor_gradeid_fkey FOREIGN KEY (gradeid) REFERENCES public.grade(id) ON UPDATE CASCADE ON DELETE CASCADE;
 R   ALTER TABLE ONLY public.subject_tutor DROP CONSTRAINT subject_tutor_gradeid_fkey;
       public               ims    false    233    229    3426            z           2606    33213 *   subject_tutor subject_tutor_subjectid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.subject_tutor
    ADD CONSTRAINT subject_tutor_subjectid_fkey FOREIGN KEY (subjectid) REFERENCES public.subject(id) ON UPDATE CASCADE ON DELETE CASCADE;
 T   ALTER TABLE ONLY public.subject_tutor DROP CONSTRAINT subject_tutor_subjectid_fkey;
       public               ims    false    3422    233    227            {           2606    33218 (   subject_tutor subject_tutor_tutorid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.subject_tutor
    ADD CONSTRAINT subject_tutor_tutorid_fkey FOREIGN KEY (tutorid) REFERENCES public.tutor(id) ON UPDATE CASCADE ON DELETE CASCADE;
 R   ALTER TABLE ONLY public.subject_tutor DROP CONSTRAINT subject_tutor_tutorid_fkey;
       public               ims    false    3406    233    221            �           2606    33287 $   timetable timetable_classroomid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT timetable_classroomid_fkey FOREIGN KEY (classroomid) REFERENCES public.classroom(id) ON UPDATE CASCADE ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.timetable DROP CONSTRAINT timetable_classroomid_fkey;
       public               ims    false    3430    241    231            �           2606    41646 *   tutor_payments tutor_payments_tutorid_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.tutor_payments
    ADD CONSTRAINT tutor_payments_tutorid_fkey FOREIGN KEY (tutorid) REFERENCES public.tutor(id);
 T   ALTER TABLE ONLY public.tutor_payments DROP CONSTRAINT tutor_payments_tutorid_fkey;
       public               ims    false    221    3406    249            +   ,  x�uVA��0<�W�=Y�ؾ�!�����"��(� a��ƆI�=P��3���'<����_� �R��tpվ_+h$>ԶQW۟W��"�[Z����>M��K����HD�M�pU�+W֪�����t�4ҹ�%� �F�	̲$K.0�
d{YU�k�JzV�Ƈۏ�j���o�>eCJe�y��Y���jy�B�gP.�y���]�U[�z�[�����f�d���Uz<������d��#���gN�~�������y���Ѩ��<)��;��ɴ�O����/�c����O�q�*���ͯ��E|�f��M��>��j=T��6���t��ϒ�l������e�.q�����*�t�8fB��O����h���azu�.f�L��� )�8ǖ @E���=��|�Ȣ;�Zg3Q<�f����^��A��Qu�a �P��e�xV)�8~���
/��a�0�4b��Q�Hg��	�0���/�o�4�W�Τ�x)��f2�]݋VWhn�UU/?P�|�<�=
3^`��u-�IqhS���x�(���1�1�7�`�)�mk�ZE��G���ͩF?�����s���8�ʠ:C�H�x)�D���r��3�w\!(�`]������g��L����{�DF�;�B����d��N1��q�(R�?t)ǻ���Q8�Pj�yO%����t�Y0�c��xݑm%��0!�˨��F��p�����)D�x\)��:����Ce�F<�f"\��|?�/��'�f/ҽخv�(�b���[&�,b���Fd��з�׊1���g      %   �   x����
�0F�ܧ�.	�'�i�V��#��+��`�
��K��;;�n�]��1�wt���@�1Y���j> �� NZ��%K+od�.�:�M����h�&�x������?�]Ye͒W�y7\�#j�_U�. ��^�      5   E   x�3�4�4�v�4202�50�50�4 B��̲T���9S��������\������X�� �,W� Q�G      #   S   x�3�t/JLIU��4202�50�54S00�21�26�3�4633�60�/�e5Ő�B�Ì1���1Fc
3Ƙ"cb���� |bF�      3   �   x�}��j�0���S�^jdK���J[�N+;F��80��uwI�d�Ň���~8��>\^� ��ҵ��o��}{}?���>�Q�N*'K��
r�!nSÅ#ǃvP���qb�HXh�3���_M�� i����QC� �E[��!.53jB�y�� ��rO/��^m1����
T���p�s��xMQR�i�1w�@j'         [  x���Ko�0���Sp�j��ⴡ�!�P�c��m�����7�VB�=t��Ҍ5��� P�$ճ��R���)���FUn(��:	��ǽ�x���n�+��j+������3{��&����DL�Qg�Oy��}�j���*��F��;ߩz[��:K��t]�U��W[(���Y��H]�tk�� r��'�=����z���+uȢ;C+M)G;r���~��D͋�� ��g���6�4M˲Ԝoq���t�1�ˑ�G�q��*
������[Y&~n)O�E��t+��qO~�y.6<#e3�Ә��×"π�Iy���!�1n�&�ń/L�,�L�8�F�#�.�*������Yl�櫷1;g�I��Z�5��
Q�vQ�cV���'{��6;F��׬��޸�x�8�?x��v�k���xy�Q�tK:��P#C��)��tJY���7io���t؟c> =.=~��|sF�S��?���i:�|F���jv��Y��V��3��Þ8Cs<W��L�՛HރY���"۵��4�W�Lg��t���q;N�֔���;�l�F��$������%�Z�ߏH�         C  x���[��J���W���9%u��S�wDA��������S��}z%�2��d�efԨ�8����9���o�@�8��џ��I@�K�A�8V�I,����f'�mS�t�&��Ԟ��0շ�������C��"K�@0�� ���B�H��'@�OZ�0��EQ���}��9����b��t�[}8��u,]�$�MGF"�m�Midp:���i_:M}���$t�%�v��1�A�A�`W�:�Ob�룊�җ��r r�l��O����r��К��w����vgh�w����ΩٱL9I�dYV�s��q�����2B�����Iǫ��0"����k������y<�J�Ey>���h�u�5t9��8!Bc��1
�9(s/�o�ʋ��u��.��JJ5ٸe����
��xw3ga����y	�d��v�ݼx�0h/�7���	%����j	H����_��t�@���(LÏW��{'
U[�Y�ă���/;���a�6C"B�p��P�rS�7�StLSv$���IB���p�6��_����[�2[��36e/o/�� �, +��X����׊h��M{�Sz�]RJƻ�F��R%V^�H��"*���~i6�ؤ�n���UE�H-�m����v��O%Cթ���%_<��n�1HN���_j���)��S^����$(`(ւ���@�c�^��s�g�r��E,�.S0���	��z�(��R.��L���;��ɺO�p�P��O�qq��q5�[H2T,T�_�f��Ԁ�����_U�C��uP)&�&�م7�޵��6��=T���~���{���&G5�e�{��=��ؒ��W��Ə@�` �,��_be;��u@��
](��PEr��ޱY����ѽ)�y�f�<`9���l�,zC�5�!���r	�0ڧ�Y8*����nCfW�4|��>k�q��F��t�����=?V�Vd� �[-����b���B��k��ez���}Y~1D-Ș��y\��K����1c�Y�y��������j�#kǲo׏��Ôvվs��}�\eI?��X�,���T��";eD�a-�_��&�k?��=����on��+���j�؃��,�dP���2�(�qr���]pR�A����o��y
 3��:ޯ�3��>v	8��Ueީ0�B{~ja�?���X7��p����bx:���p��j6^h᧨Jw�7B�=<PPx�j��vlea
���"V���H��Tk�CK��Rp7Zti`��	�{��}5 wu�O�=$޴�2L�oD�3 ��"�Y�k�1[`�ǷR�n�C�?+zvR�U'�y 6ubiȃ�i)$v[I��Zl_�w��x��]������%/�|&%�z)��jp��ln'r���n'ᒀ��&oG�8uo�s�.�$�w�mRt>֛��c���_��T`����m@�c#�ة��B�>��7�8����W�EB�2�`h�Y̵3��[�45W�Ɔ"ƛܠ��<�[H��R��tP��xWa���۫�<s�Hq׏:���c5�o���ږ2��0�]�d� �4��c3�l�C���	M����3�D�%�n�_�(ql�V����������z���Y�;�^ZF���AuvwM��oX�Ͳ�N7t����oҸ���l��@+u��n���l�f�)wz�*��VzOd��ד�W)��z�df>���1Kwu3��>�,{;jn��d�s�$����aK����`�6ؚ�Fm�,ޟ�&���`�pzr�K���-6s���Qo.B:9HvJ�|6�V���,{Fs�����@�M�k���h4��FT      1   e   x�3�4��
�s�4202�44 � W?O?w������������������������6P^Y.#�����c-��:z��k��24�340613�b$�,W� �S!      )   f   x���;
�@D����.���Y<���Tb#��y<!�N�9�2]j����觽0�`EF�A��HB�C���U�Ğcf��\b���n/�W{�9���Y      !   e   x�3��u�p����FF��&��f
&V&�V�&z��ff���e��8<"�)5Ř������H��1�t����w��SNW?w�`�L����� ,cG/      '   �   x���=� ��>E�(���Yz�s�Zh�!����g�!�"&����~�6�&�(��λ�C����B<�0��F����j���ȵ�7��$[��.�ґ�{r��	}�X'dPvH���&�;�����V(��q�2��R�4��JwI�iM��7e��_	�v�w�      /   =  x���[n�0E��U��
�����`���B`�"4SEE<���\@�s,�)`�$h�zl�"[��-����E�����۔$l�lh���R#tc�애��6���N�R#���t+�C�Fԥ�[�9Tj���������/�|*����/����|Ѳ�<�9Y�A'��}@QRΩ�x�>w}D��]�3%�����r߰giz?�/̹o8R�6q8���gJ���C����H	������,�xB2�VІo�b� �t���ϕQ�	_�tI	sS���u{Fh����}������ _f�?�%%᦮C7N}Ǒ�c"�o�Pz-      -   �   x�m�Aj�@EךS�)ҌMIw�LH!�C�EٸF�.�x��ou5`Z}�?b�v���r"���Ͽa�X�zZ���%�m�uC��}#�y�{�+]��I�؊D%�to�i�H�q�Q��'�6��DB�7��4�I3�X/7�g��R�!�2���:������l�N��>��S;�"�2d�F���P~���S]l$����:�9�[SRf�/ƘT7T�         )  x���ˎ�@�u���ݤ�n�j�AD��4f6���(
>�Э�Y����I��I*_�9` J���?�I��0K�3�|v�pq:���'��r���K�d�;�~�r���s��C�v�w���<۰��r0�x
fI$8�e!�1b���y����WB%��NG����-�{��{3����G�����vK��Z%ru-κ3�k��X�sRjy�+�y�Ot�2`d(�����i��7���,�i�����a	�,�-S���)|���-e��7UJl�����l���!g9E!����"K!�R����~��-��j��pu���X��ˡ���Wi���u��^�9ҭ�Em�R�f`�BQ��L�}�<;��)���)�!��m�oqo6t3��~7c���LUʁ4N��/��,�6�N�^�[�l�s
�=`��0��#8E��\����!q`���} �������dS���<�;�.��� AG���A�]C�<�cr)B�**��J0�J`t}y̚��0�����>!�7Ө��!����o��j��%"      7   ]   x�}�A
�0��+�K�&�I۷��w؂Bv�QR
2X�� ��g�.!����P����k5��ļ�F���;ۯZkG����^���;!?         �  x���˲�����=�ى.���9: QD�[�	*wT@���\��{��IG��� �Ȫ�+EY�s�#�׿:a��+�;r~���g=�MMm'���������]�,w�OWZ��7qPW�<���)ZfT�/	˶�Q�B����Qx��1�%�,����~��4�(σ?R?R�/BU8D�������kb��2sRn��UGj�m��
6!K���(���T^�[��7��_}�jĜҏ�|`�R��A�@<��I�)�$�㛻�۫��lq�s�p;F[�XY���Ņ~����,�m�[�;G�'Z��H?#/Q��}��hZS}T/70�ͽ��=T���F	cČ� Es���F%B���b���8w�{�����˵�f�K��W��9N����~�hZuޢ�xLQ r�����M%Yb�Ε��b͔��d�ef)3��q���2���Q����h�mU�{�|1��c��A<�h_�9����WI��;�|+[jA`Q�-x$�4r��l��{R"{{]9���������6O��ǂW�
�f�R�b���<!FNC8]�=������ǒ�6��,>�8��iy[:4�!̊��`��im��C a ����ss��>�I��
6)�J�ę�����F�I��Ab���,�s;����R��P���X�u�JB�P�sLD]�	s�+U�BS���f.{575S%�+�c��H3jyX�Q�!�+2$ 2,ƃd?�$��zn��O��p�g���R��D�= ���gNH���p��ޙ�V����ߓ�c�
CK��FBDH�8�Ljcl��WP����`~����W��8?dKƁ"�Ǥ�[�o,�U�S@�!; �E$!M��Y4��b35����G�|�K�2q���ѯ���ڨ���Z1Fk�©]`�_t�#`�f����WI��m�l����t�Y��ˮMQ��V�����^ �ft��Of	 ɨ4ڽ�7�����0<��PӾ�$d3x�-"���;�v�5q]�'��M}�v���E�S�r+�����'�Lk���-��� �ᘁC�U$!K��q���J��&��~p^����� ��4�m�h�uu�����y8�G����WW�E�������#����+x���n5��D�ʋ��S�7RCG�"�?����Ep6����#��uw5`��ၓ�M%!O,ݛ��4��m��~�T�v��Tr�i����T���R�����{O�dr��N�j3p��0��*	b�D�-���t����aN����'�����~(�Cm �}hH<�(��W�����f1��g�ql��J"�X���F���:Y�y����v�Qخ�v���u�V��{�ؕs�/������oH�C`_DAB��a���L}6��K��h��OA��P�K��i�fe�π6�%O�i�.ũo���/���QCk�U%��5i<��Q�`[1�}��̮����ԖLm����U�r��Lv
N%(s��Sc�������J"��:��8����}��:[�70
d�l-<��q
�G���(�)�R�l��3S?��~�����<7Fݏ�X�w)�T�n=;�u.C���'�6�H�/�@���<���2�S!.��`�M��i4��2��AߞUU��1��|��`o��T1���}��۝^�,n�Am��g�\�,Oe�'��I����'���	�W���]y���{�vO%�H��?yN     