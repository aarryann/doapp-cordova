USE hectre

DELIMITER $$

DROP PROCEDURE IF EXISTS Users_SignIn$$

CREATE PROCEDURE Users_SignIn(tenantId int, uname varchar(100), pwd varchar(100))
BEGIN
	#sample query format: { userId: 1, studyId: 3, siteId: 5 }

	DECLARE usrId int default 0;
	DECLARE usrPassword varchar(100) default null;
	DECLARE tusId int default 0;
	DECLARE usrDisplayTxt varchar(100) default null;
	DECLARE stuId int default 0;
	DECLARE sitId int default 0;
	DECLARE studyName varchar(100) default null;
	DECLARE siteName varchar(100) default null;
	DECLARE sveId int default 0;
	DECLARE sveVerTxt varchar(100) default null;

    SELECT usr_id, usr_password, tus_id, usr_display_txt into
	usrId, usrPassword, tusId, usrDisplayTxt
	from users
	join tenant_users on usr_id = tus_usr_id and tus_tnt_id = tenantId
	WHERE usr_uname = uname and usr_status = 'Active';

	if usrId = 0 then
	begin
		select "FAILED" as status;
	end;
	else
	begin
		# TODO: Change later to decrypt encrypted password
		if pwd = usrPassword then
		begin
			#TODO: Study & Site configuration
			select tst_stu_id, tsi_sit_id, stu_display_txt, sit_site_name, sve_id, sve_ver_txt
			into stuId, sitId, studyName, siteName, sveId, sveVerTxt
			from tenant_studies
			join studies on tst_stu_id = stu_id
			join tenant_sites on tsi_tnt_id = tst_tnt_id
			join sites on tsi_sit_id = sit_id
			join site_registered_studies on stu_id = srs_stu_id and sit_id = srs_sit_id and srs_reg_current = 'Y'
			join study_versions on sve_id = srs_sve_id
			where tst_tnt_id = tenantId;

			select "OK" as status, usrId id, usrDisplayTxt fullName, stuId studyId, sitId siteId, studyName, siteName;
		end;
		else
		begin
			# TODO: Log an unsuccessful attempt
			select "FAILED" as status;
		end;
		end if;
	end;
	end if;
END$$

DELIMITER ;

DELIMITER $$

DROP PROCEDURE IF EXISTS GetUserDetails$$

CREATE PROCEDURE GetUserDetails(in p_uname varchar(200))
BEGIN
    SELECT * from users WHERE usr_uname = p_uname;

END$$

DELIMITER ;

DELIMITER $$

DROP PROCEDURE IF EXISTS GetUsers$$

CREATE PROCEDURE GetUsers()
BEGIN
    SELECT * from users;

END$$

DELIMITER ;

USE hectre

DELIMITER $$

DROP PROCEDURE IF EXISTS Participants_CheckCounter$$

CREATE PROCEDURE Participants_CheckCounter(siteId int, studyId int, query JSON)
BEGIN
	#sample query format: {}
    SELECT 'true' as PROCEED;

END$$

DELIMITER ;

DELIMITER $$

DROP PROCEDURE IF EXISTS Participants_CheckDuplicate$$

CREATE PROCEDURE Participants_CheckDuplicate(siteId int, studyId int, query JSON)
BEGIN
	#sample query format: {}
    DECLARE fname varchar(100) default null;
    DECLARE mi varchar(100) default null;
    DECLARE lname varchar(100) default null;
	DECLARE gender varchar(100) default null;
    DECLARE dob DATETIME default null;

    SET fname = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.fname')), '');
    SET mi = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.mi')), '');
    SET lname = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.lname')), '');
	SET gender = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.gender')), '');
    SET dob = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.dob')), '');

    SELECT
		CASE WHEN count(1) > 1 then 'false'
			else 'true'
		end as PROCEED
	from screening
	where scn_fname = fname and scn_mi = mi
	and scn_lname = lname and scn_dob = dob
	and scn_gender_curr = gender;

END$$

DELIMITER ;

DELIMITER $$
CREATE DEFINER=`appuser`@`%` PROCEDURE `StudySite_FindParticipants`(siteId int, studyId int, query JSON)
BEGIN
	#sample query format: { userId: 1, studyId: 3, siteId: 5 }
    DECLARE userId INT default null;
    DECLARE sortBy varchar(200) default null;
    DECLARE filterBy varchar(200) default null;

    SET userId = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.userId')), '');
    SET sortBy = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.sortBy')), '');
    SET filterBy = IFNULL(JSON_UNQUOTE(JSON_EXTRACT(query, '$.filterBy')), '');

	SELECT pen_enc_dt encounterDate, pen_event_name encounterType, pen_enc_reason encounterReason, pat_fname fname, pat_mi mi, pat_lname lname, pat_gender_curr gender, pat_dob dob, NULL AS consentDate, NULL AS consentVersion, pat_mrn mrn, spt_spid spid, pen_id encounterId, pen_spt_id studySiteParticipantId, pen_enc_sve_id studyVersionId, SPT_ENROLL_DT enrollmentDate, PEN_LAST_CHANGE_DT lastEdited
	FROM participant_encounters
	JOIN study_site_participants ON spt_id = pen_spt_id
	JOIN participants ON spt_pat_id = pat_id
    JOIN screening ON spt_scn_id = scn_id
	where spt_stu_id = studyId and spt_sit_id = siteId AND (spt_spid like concat('%',filterBy,'%') OR concat(left(scn_fname, 1), ' ', left(scn_lname, 1)) like concat('%',filterBy,'%'))
	union
	SELECT pen_enc_dt encounterDate, pen_event_name encounterType, pen_enc_reason encounterReason, scn_fname fname, scn_mi mi, scn_lname lname, scn_gender_curr gender, scn_dob dob, NULL AS consentDate, NULL AS consentVersion, scn_mrn mrn, concat(left(scn_fname, 1), ' ', left(scn_lname, 1)) spid, pen_id encounterId, pen_spt_id studySiteParticipantId, pen_enc_sve_id studyVersionId, NULL as enrollmentDate, PEN_LAST_CHANGE_DT lastEdited
	FROM participant_encounters
	JOIN study_site_participants ON spt_id = pen_spt_id and spt_pat_id is null
    JOIN screening ON spt_scn_id = scn_id
	where spt_stu_id = studyId and spt_sit_id = siteId and (spt_spid like concat('%',filterBy,'%') OR concat(left(scn_fname, 1), ' ', left(scn_lname, 1)) like concat('%',filterBy,'%'))
	order by
		CASE WHEN sortBy='lastEdited ASC' THEN lastEdited end,
		CASE WHEN sortBy='gender ASC' THEN gender end ASC,
		CASE WHEN sortBy='lastEdited DESC' THEN lastEdited end DESC,
		CASE WHEN sortBy='gender DESC' THEN gender end DESC,
		CASE WHEN sortBy='enrollmentDate ASC' THEN enrollmentDate END ASC,
		CASE WHEN sortBy='enrollmentDate DESC' THEN enrollmentDate END DESC;

END$$
DELIMITER ;

DELIMITER $$

DROP PROCEDURE IF EXISTS Encounters_GetEncounterInfoById$$

CREATE PROCEDURE Encounters_GetEncounterInfoById(encounterId int)
BEGIN
#	{ encounterDate: "2017-12-01", encounterType: "Screening", encounterReason:"", fname: "Andy", mi: "", lname: "Garcia", gender: "M", dob: "1970-01-10", consentDate:"2017-12-01", consentVersion: 1, mrn: "TEMP-009", spid: "HC005-001", userId: 1, studyId: 3, siteId: 5, studyVersionId: 2, studySiteParticipantId: 2, encounterId: 1 }
	DECLARE participantId INT DEFAULT NULL;

    SELECT spt_pat_id INTO participantId
    FROM participant_encounters
    JOIN study_site_participants ON spt_id = pen_spt_id
    WHERE pen_id = encounterId;

    IF participantId IS NULL THEN
    BEGIN
		SELECT pen_enc_dt encounterDate, pen_event_name encounterType, pen_enc_reason encounterReason, scn_fname fname, scn_mi mi, scn_lname lname, scn_gender_curr gender, scn_dob dob, NULL AS consentDate, NULL AS consentVersion, scn_mrn mrn, concat(left(scn_fname, 1), ' ', left(scn_lname, 1)) spid, pen_id encounterId, pen_spt_id studySiteParticipantId, pen_enc_sve_id studyVersionId, scn_id as screeningId, null as participantId
		FROM participant_encounters
		JOIN study_site_participants ON spt_id = pen_spt_id
        JOIN screening ON spt_scn_id = scn_id
		WHERE pen_id = encounterId;
	END;
	ELSE
    BEGIN
		SELECT pen_enc_dt encounterDate, pen_event_name encounterType, pen_enc_reason encounterReason, pat_fname fname, pat_mi mi, pat_lname lname, pat_gender_curr gender, pat_dob dob, NULL AS consentDate, NULL AS consentVersion, pat_mrn mrn, spt_spid spid, pen_id encounterId, pen_spt_id studySiteParticipantId, pen_enc_sve_id studyVersionId, null as screeningId, pat_id as participantId
		FROM participant_encounters
		JOIN study_site_participants ON spt_id = pen_spt_id
        JOIN participants ON spt_pat_id = pat_id
		WHERE pen_id = encounterId;
	END;
	END IF;
END$$

DELIMITER ;

DELIMITER $$

DROP PROCEDURE IF EXISTS Encounters_CreateEncounter$$

CREATE PROCEDURE Encounters_CreateEncounter(siteId int, studyId int, query JSON)
BEGIN
#	{ encounterDate: "2017-12-01", encounterType: "Screening", encounterUnscheduled: "No", encounterReason:"", fname: "Andy", mi: "", lname: "Garcia", gender: "M", dob: "1970-01-10", consentDate:"2017-12-01", consentVersion: 1, mrn: "TEMP-009", userId: 1, studyId: 3, siteId: 5, studyVersionId: 2, studySiteParticipantId: 2 }

	DECLARE encounterDate DATETIME default null;
    DECLARE consentDate DATETIME default null;
    DECLARE dob DATETIME default null;

    DECLARE encounterType varchar(100) default null;
    DECLARE encounterUnscheduled varchar(20) default null;
    DECLARE encounterReason varchar(100) default null;
    DECLARE fname varchar(100) default null;
    DECLARE mi varchar(100) default null;
    DECLARE lname varchar(100) default null;
	DECLARE gender varchar(100) default null;
    DECLARE consentVersion varchar(100) default null;
    DECLARE mrn varchar(100) default null;

    DECLARE userId INT default null;
    DECLARE studyVersionId INT default null;
    DECLARE studySiteParticipantId INT default null;
    DECLARE screeningId INT default null;

	SET encounterDate = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.encounterDate')), '');
    SET consentDate = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.consentDate')), '');
    SET dob = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.dob')), '');

    SET encounterType = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.encounterType')), '');
    SET encounterUnscheduled = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.encounterUnscheduled')), '');
    SET encounterReason = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.encounterReason')), '');
    SET fname = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.fname')), '');
    SET mi = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.mi')), '');
    SET lname = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.lname')), '');
	SET gender = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.gender')), '');
    SET consentVersion = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.consentVersion')), '');
    SET mrn = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.mrn')), '');

    SET userId = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.userId')), '');
    SET studySiteParticipantId = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.studySiteParticipantId')), '');

	SELECT SRS_SVE_ID INTO studyVersionId
	FROM SITE_REGISTERED_STUDIES
	WHERE SRS_STU_ID = studyId AND SRS_SIT_ID = siteId
	AND SRS_REG_CURRENT = 'Y';

    if studySiteParticipantId is null then
	begin
		INSERT INTO SCREENING ( SCN_TNT_ID, SCN_MRN, SCN_FNAME, SCN_MI, SCN_LNAME, SCN_GENDER_CURR, SCN_DOB, SCN_SCREEN_DT, SCN_SCREEN_STATUS, SCN_LAST_USR_ID )
		VALUES ( 1, mrn, fname, mi, lname, gender, dob, encounterDate, 'In Progress', userId );

		set screeningId = last_insert_id();

		INSERT INTO STUDY_SITE_PARTICIPANTS ( SPT_PAT_ID, SPT_SCN_ID, SPT_SIT_ID, SPT_STU_ID, SPT_SPID, SPT_ENROLL_DT, SPT_ENROLL_STATUS, SPT_ENROLL_STATUS_DT, SPT_LAST_USR_ID )
		VALUES ( NULL, screeningId, siteId, studyId, NULL, NULL, 'In Progress', CURRENT_DATE(), userId );

		set studySiteParticipantId = last_insert_id();
	end;
    end if;
	INSERT INTO PARTICIPANT_ENCOUNTERS ( PEN_SPT_ID, PEN_ENC_SVE_ID, PEN_EVENT_NAME, PEN_EVENT_UNSCH, PEN_ENC_DT, PEN_ENC_REASON, PEN_LAST_USR_ID )
	VALUES ( studySiteParticipantId, studyVersionId, encounterType, encounterUnscheduled, encounterDate, encounterReason, userId );

	CALL Encounters_GetEncounterInfoById( last_insert_id() );
END$$

DELIMITER ;

DELIMITER $$

DROP PROCEDURE IF EXISTS Encounters_UpdateEncounter$$

CREATE PROCEDURE Encounters_UpdateEncounter(encounterId int, query JSON)
BEGIN
#	{ encounterDate: "2017-12-01", encounterType: "Screening", encounterUnscheduled: "No", encounterReason:"", fname: "Andy", mi: "", lname: "Garcia", gender: "M", dob: "1970-01-10", consentDate:"2017-12-01", consentVersion: 1, mrn: "TEMP-009", userId: 1, studyId: 3, siteId: 5, studyVersionId: 2, studySiteParticipantId: 2 }

	DECLARE encounterDate DATETIME default null;
    DECLARE consentDate DATETIME default null;
    DECLARE dob DATETIME default null;

    DECLARE encounterType varchar(100) default null;
    DECLARE encounterUnscheduled varchar(20) default null;
    DECLARE encounterReason varchar(100) default null;
    DECLARE fname varchar(100) default null;
    DECLARE mi varchar(100) default null;
    DECLARE lname varchar(100) default null;
	DECLARE gender varchar(100) default null;
    DECLARE consentVersion varchar(100) default null;
    DECLARE mrn varchar(100) default null;

    DECLARE userId INT default null;
    DECLARE studyVersionId INT default null;
    DECLARE studySiteParticipantId INT default null;
    DECLARE screeningId INT default null;
    DECLARE participantId INT default null;

	SET encounterDate = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.encounterDate')), '');
    SET consentDate = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.consentDate')), '');
    SET dob = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.dob')), '');

    SET encounterType = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.encounterType')), '');
    SET encounterUnscheduled = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.encounterUnscheduled')), '');
    SET encounterReason = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.encounterReason')), '');
    SET fname = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.fname')), '');
    SET mi = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.mi')), '');
    SET lname = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.lname')), '');
	SET gender = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.gender')), '');
    SET consentVersion = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.consentVersion')), '');
    SET mrn = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.mrn')), '');

    SET userId = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(query, '$.userId')), '');

	SELECT SPT_SCN_ID, SPT_PAT_ID, SPT_ID
	INTO screeningId, participantId, studySiteParticipantId
	FROM STUDY_SITE_PARTICIPANTS
	JOIN PARTICIPANT_ENCOUNTERS ON PEN_SPT_ID = SPT_ID
	WHERE PEN_ID = encounterId;

    if encounterType = 'Screening' then
	begin
		UPDATE SCREENING
		SET SCN_MRN = mrn
		, SCN_FNAME = fname
		, SCN_MI = mi
		, SCN_LNAME = lname
		, SCN_GENDER_CURR = gender
		, SCN_DOB = dob
		, SCN_SCREEN_DT = encounterDate
		, SCN_LAST_USR_ID = userId
		WHERE SCN_ID = screeningId;
	end;
	end if;

	if participantId is not null then
	begin
		UPDATE PARTICIPANTS
		SET PAT_MRN = mrn
		, PAT_FNAME = fname
		, PAT_MI = mi
		, PAT_LNAME = lname
		, PAT_GENDER_CURR = gender
		, PAT_DOB = dob
		, PAT_LAST_USR_ID = userId
		WHERE PAT_ID = participantId;
	end;
	end if;

	UPDATE PARTICIPANT_ENCOUNTERS
	SET PEN_EVENT_NAME = encounterType
	, PEN_EVENT_UNSCH = encounterUnscheduled
	, PEN_ENC_DT = encounterDate
	, PEN_ENC_REASON = encounterReason
	, PEN_LAST_USR_ID = userId
	WHERE PEN_ID = encounterId;

	CALL Encounters_GetEncounterInfoById( encounterId );
END$$

DELIMITER ;

DELIMITER $$

DROP PROCEDURE IF EXISTS StudyConsents_GetAllConsents$$

CREATE PROCEDURE StudyConsents_GetAllConsents(studyId int)
BEGIN

	Select sco_id scoId, sco_ver_txt scoVerText, sco_consent_url scoConsentUrl from Study_consents
where SCO_STATUS = 'Active' and SCO_STU_ID =  studyId;

END$$

DELIMITER ;

DELIMITER $$

DROP PROCEDURE IF EXISTS StudyEncounters_GetAllEncounters$$

CREATE PROCEDURE StudyEncounters_GetAllEncounters(studyId int)
BEGIN

	SELECT SEV_EVENT_NAME eventName, sev_id sevId, sev_short_cd sevShortCd,sev_event_order sevEventOrder, sev_duration sevDuration, sev_unit_duration sevUnitDuration
    FROM study_events where sev_stu_id = studyId
    order by sev_event_order asc;

END$$

DELIMITER ;
