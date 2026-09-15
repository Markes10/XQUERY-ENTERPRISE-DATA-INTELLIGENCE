xquery version "3.1";

(: ============================================================================
   Enterprise Clinical & Data Intelligence Engine
   Language: XQuery 3.1
   Domain: HL7/FHIR Clinical Repository Risk Extraction
   ============================================================================ :)

declare default element namespace "http://hl7.org/fhir";

declare function local:calculate-risk-score($hba1c as xs:decimal, $systolicBp as xs:integer) as xs:string {
    if ($hba1c >= 9.0 or $systolicBp >= 160) then "CRITICAL_CARDIOVASCULAR_RISK"
    else if ($hba1c >= 7.5 or $systolicBp >= 140) then "ELEVATED_CHRONIC_RISK"
    else "NORMAL_MANAGED"
};

<ClinicalRiskReport generatedAt="{current-dateTime()}">
{
    for $patient in /Bundle/entry/resource/Patient
    let $patientId := $patient/id/@value
    let $patientName := concat($patient/name/given/@value, ' ', $patient/name/family/@value)
    let $gender := $patient/gender/@value
    
    (: Extract latest HbA1c Observation :)
    let $hba1cObs := /Bundle/entry/resource/Observation[subject/reference/@value = concat('Patient/', $patientId) and code/coding/code/@value = '4548-4'][last()]
    let $hba1cVal := xs:decimal($hba1cObs/valueQuantity/value/@value)
    
    (: Extract latest Blood Pressure Observation :)
    let $bpObs := /Bundle/entry/resource/Observation[subject/reference/@value = concat('Patient/', $patientId) and code/coding/code/@value = '8480-6'][last()]
    let $bpVal := xs:integer($bpObs/valueQuantity/value/@value)
    
    where $hba1cVal >= 7.0 or $bpVal >= 140
    order by $hba1cVal descending
    
    return
        <HighRiskCohort patientId="{$patientId}">
            <Name>{$patientName}</Name>
            <Gender>{$gender}</Gender>
            <HbA1cUnit percent="{$hba1cVal}">{$hba1cVal}%</HbA1cUnit>
            <SystolicBloodPressure mmHg="{$bpVal}">{$bpVal} mmHg</SystolicBloodPressure>
            <RiskTriageTier>{local:calculate-risk-score($hba1cVal, $bpVal)}</RiskTriageTier>
        </HighRiskCohort>
}
</ClinicalRiskReport>
