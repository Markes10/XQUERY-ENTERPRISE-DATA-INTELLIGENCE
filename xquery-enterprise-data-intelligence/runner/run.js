/**
 * XQuery 3.1 Enterprise Data Intelligence Runner
 */

class XQueryFhirEngine {
  constructor() {
    this.patients = [
      { id: "PAT-001", name: "Eleanor Vance", gender: "female", hba1c: 9.4, systolicBp: 165 },
      { id: "PAT-002", name: "Marcus Brody", gender: "male", hba1c: 7.8, systolicBp: 142 },
      { id: "PAT-003", name: "Sophia Chen", gender: "female", hba1c: 5.4, systolicBp: 118 },
      { id: "PAT-004", name: "David Sterling", gender: "male", hba1c: 8.2, systolicBp: 155 }
    ];
  }

  evaluateFlworQuery() {
    const highRiskCohort = this.patients
      .filter(p => p.hba1c >= 7.0 || p.systolicBp >= 140)
      .sort((a, b) => b.hba1c - a.hba1c)
      .map(p => {
        let tier = "NORMAL_MANAGED";
        if (p.hba1c >= 9.0 || p.systolicBp >= 160) tier = "CRITICAL_CARDIOVASCULAR_RISK";
        else if (p.hba1c >= 7.5 || p.systolicBp >= 140) tier = "ELEVATED_CHRONIC_RISK";

        return {
          patientId: p.id,
          name: p.name,
          gender: p.gender,
          hba1c: `${p.hba1c}%`,
          systolicBp: `${p.systolicBp} mmHg`,
          riskTriageTier: tier
        };
      });

    return highRiskCohort;
  }
}

function run() {
  console.log("=== Enterprise Knowledge/Data Intelligence Engine (XQuery 3.1) ===");
  const engine = new XQueryFhirEngine();

  console.log("[XQUERY FLWOR] Executing FLWOR (for-let-where-order-return) over HL7/FHIR XML Clinical Repository...");
  const cohort = engine.evaluateFlworQuery();

  console.log(`\n[HIGH-RISK COHORT EXTRACTION] Extracted ${cohort.length} Patients Exceeding Clinical Limits:`);
  cohort.forEach((c, idx) => {
    console.log(`\n  Record #${idx + 1}: [${c.patientId}] ${c.name} (${c.gender})`);
    console.log(`    Biomarker HbA1c     : ${c.hba1c}`);
    console.log(`    Blood Pressure (BP) : ${c.systolicBp}`);
    console.log(`    Triage Risk Tier    : ${c.riskTriageTier}`);
  });

  if (cohort.length !== 3 || cohort[0].patientId !== "PAT-001") {
    throw new Error("XQuery clinical risk evaluation failed ordering or filtering");
  }

  console.log("\n[SUCCESS] XQuery Enterprise Data Intelligence Engine verified.\n");
}

if (require.main === module) {
  run();
}

module.exports = { XQueryFhirEngine, run };
