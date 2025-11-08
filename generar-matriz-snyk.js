// generar-matriz-snyk.js
import fs from "fs";

const snykReportPath = "./snyk-report.json";
const snykData = JSON.parse(fs.readFileSync(snykReportPath, "utf-8"));

// Validar formato del reporte
if (!Array.isArray(snykData.vulnerabilities)) {
  console.error("❌ No se encontraron vulnerabilidades en el archivo snyk-report.json");
  process.exit(1);
}

const vulnerabilidades = snykData.vulnerabilities;

let markdown = `# 🧩 RISK_MATRIX.md (Generada desde Snyk)
### Proyecto: UNA-CHAT / Laboratorio 5
### Fecha: ${new Date().toLocaleDateString()}

| Paquete | Versión | Severidad | CVE | Riesgo Inherente | Recomendación |
|----------|----------|------------|------|------------------|----------------|\n`;

vulnerabilidades.slice(0, 20).forEach(vuln => {
  const pkg = vuln.packageName || "Desconocido";
  const version = vuln.version || "N/A";
  const severity = vuln.severity || "medium";
  const cve = vuln.identifiers?.CVE?.[0] || "Sin CVE";
  let riesgo = "Moderado";
  const recomendacion = vuln.upgradePath?.[0] ? `Actualizar a ${vuln.upgradePath?.[0]}` : "Revisar dependencia";

  switch (severity) {
    case "critical":
      riesgo = "Muy Alto";
      break;
    case "high":
      riesgo = "Alto";
      break;
    case "medium":
      riesgo = "Moderado";
      break;
    case "low":
      riesgo = "Bajo";
      break;
  }

  markdown += `| ${pkg} | ${version} | ${severity.toUpperCase()} | ${cve} | ${riesgo} | ${recomendacion} |\n`;
});


// Guardar el archivo
fs.writeFileSync("RISK_MATRIX.md", markdown, "utf-8");
console.log("✅ Nueva matriz de riesgo generada correctamente desde Snyk: RISK_MATRIX.md");
