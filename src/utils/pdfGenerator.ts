import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FullClinicalRecordResponse } from '../types/clinicalRecord';

// Color palette from the system
const COLORS = {
  primary: '#1479FF',
  primaryDark: '#193B68',
  headerBg: '#F5F7FA',
  border: '#E2E8F0',
  text: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  tableHeader: [20, 59, 104] as [number, number, number], // RGB for #143B68
  tableRowEven: [245, 247, 250] as [number, number, number], // RGB for #F5F7FA
};

const FONTS = {
  normal: 'helvetica' as const,
  bold: 'helvetica' as const,
};

/**
 * Main function to generate a comprehensive clinical record PDF
 */
export const generateClinicalRecordPDF = (data: FullClinicalRecordResponse): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let yPos = 15;

  // Add header with institution and patient info
  yPos = addHeader(doc, data, yPos);

  // Add patient demographic data
  yPos = addPatientSection(doc, data.paciente, yPos);

  // Add consultation information
  yPos = addConsultationSection(doc, data.evolucion, yPos);

  // Add vital signs
  if (data.evolucion.signosVitales) {
    yPos = checkAndAddPage(doc, yPos, 40);
    yPos = addVitalSignsSection(doc, data.evolucion.signosVitales, yPos);
  }

  // Add clinical assessment
  if (data.evolucion.antecedentesIncidente || data.evolucion.valoracionClinica) {
    yPos = checkAndAddPage(doc, yPos, 50);
    yPos = addClinicalAssessmentSection(doc, data.evolucion, yPos);
  }

  // Add diagnostics
  if (data.evolucion.diagnosticos && data.evolucion.diagnosticos.length > 0) {
    yPos = checkAndAddPage(doc, yPos, 40);
    yPos = addDiagnosticsSection(doc, data.evolucion.diagnosticos, yPos);
  }

  // Add treatment plans
  if (data.evolucion.planesTratamiento && data.evolucion.planesTratamiento.length > 0) {
    yPos = checkAndAddPage(doc, yPos, 50);
    yPos = addTreatmentSection(doc, data.evolucion.planesTratamiento, yPos);
  }

  // Add requested exams
  if (data.evolucion.examenesSolicitados && data.evolucion.examenesSolicitados.length > 0) {
    yPos = checkAndAddPage(doc, yPos, 40);
    yPos = addExamsSection(doc, data.evolucion.examenesSolicitados, yPos);
  }

  // Add discharge information
  if (data.evolucion.altaMedica) {
    yPos = checkAndAddPage(doc, yPos, 40);
    yPos = addDischargeSection(doc, data.evolucion.altaMedica, yPos);
  }

  // Generate filename and save
  const fileName = generateFileName(data);
  doc.save(fileName);
};

/**
 * Check if we need a new page and add it if necessary
 */
function checkAndAddPage(doc: jsPDF, yPos: number, requiredSpace: number): number {
  if (yPos + requiredSpace > 280) {
    doc.addPage();
    return 15;
  }
  return yPos;
}

/**
 * Add document header with institution and patient basic info
 */
function addHeader(doc: jsPDF, data: FullClinicalRecordResponse, yPos: number): number {
  // Title
  doc.setFontSize(16);
  doc.setFont(FONTS.bold, 'bold');
  doc.setTextColor(COLORS.primaryDark);
  doc.text('REPORTE DE HISTORIA CLÍNICA', 105, yPos, { align: 'center' });
  
  yPos += 8;

  // Header table with basic info
  autoTable(doc, {
    startY: yPos,
    head: [['Establecimiento', 'Paciente', 'HC No.', 'Cédula']],
    body: [[
      data.historiaClinica.unidadOperativa || 'N/A',
      data.historiaClinica.pacienteNombreCompleto,
      data.historiaClinica.numeroHistoriaClinica,
      data.historiaClinica.pacienteCedula
    ]],
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.tableHeader,
      textColor: COLORS.white,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      halign: 'center'
    },
    margin: { left: 15, right: 15 },
  });

  return (doc as any).lastAutoTable.finalY + 10;
}

/**
 * Add patient demographic information section
 */
function addPatientSection(doc: jsPDF, paciente: any, yPos: number): number {
  // Section title
  doc.setFontSize(12);
  doc.setFont(FONTS.bold, 'bold');
  doc.setTextColor(COLORS.primaryDark);
  doc.text('1. DATOS DEL PACIENTE', 15, yPos);
  yPos += 6;

  // Calculate age
  const edad = paciente.fechaNacimiento 
    ? new Date().getFullYear() - new Date(paciente.fechaNacimiento).getFullYear()
    : 'N/A';

  // Patient data table
  const patientData = [
    ['Fecha Nacimiento', formatDate(paciente.fechaNacimiento), 'Edad', `${edad} años`, 'Lugar Nacimiento', paciente.lugarNacimiento || 'N/A'],
    ['Género', paciente.genero?.nombre || 'N/A', 'Nacionalidad', paciente.nacionalidad || 'N/A', 'Grupo Cultural', paciente.grupoCultural?.nombre || 'N/A'],
    ['Estado Civil', paciente.estadoCivil?.nombre || 'N/A', 'Nivel Instrucción', paciente.nivelInstruccion?.nombre || 'N/A', 'Grupo Sanguíneo', paciente.grupoSanguineo?.nombre || 'N/A'],
  ];

  // Contact info
  patientData.push(['Teléfono', paciente.telefono || 'N/A', 'Email', paciente.email || 'N/A', '', '']);

  // Address
  const direccionCompleta = `${paciente.direccion || ''}, ${paciente.parroquia || ''}, ${paciente.canton || ''}, ${paciente.provincia?.nombre || ''}`.trim();
  patientData.push([{ content: 'Dirección de Residencia', colSpan: 1 }, { content: direccionCompleta || 'N/A', colSpan: 5 }]);

  // Occupation
  if (paciente.ocupacion) {
    const ocupacionInfo = `${paciente.ocupacion.ocupacion?.nombre || 'N/A'} - ${paciente.ocupacion.nombreEmpresa || 'N/A'}`;
    patientData.push([{ content: 'Ocupación', colSpan: 1 }, { content: ocupacionInfo, colSpan: 5 }]);
  }

  autoTable(doc, {
    startY: yPos,
    body: patientData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: COLORS.tableRowEven, cellWidth: 30 },
      1: { cellWidth: 25 },
      2: { fontStyle: 'bold', fillColor: COLORS.tableRowEven, cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { fontStyle: 'bold', fillColor: COLORS.tableRowEven, cellWidth: 30 },
      5: { cellWidth: 'auto' },
    },
    margin: { left: 15, right: 15 },
  });

  return (doc as any).lastAutoTable.finalY + 8;
}

/**
 * Add consultation/evolution information
 */
function addConsultationSection(doc: jsPDF, evolucion: any, yPos: number): number {
  // Section title
  doc.setFontSize(12);
  doc.setFont(FONTS.bold, 'bold');
  doc.setTextColor(COLORS.primaryDark);
  doc.text('2. DATOS DE LA CONSULTA', 15, yPos);
  yPos += 6;

  const consultaData = [
    ['Fecha Consulta', formatDateTime(evolucion.fechaConsulta), 'Tipo Consulta', evolucion.tipoConsulta || 'N/A'],
    ['Profesional', evolucion.empleadoNombreCompleto || 'N/A', 'Especialidad', evolucion.empleadoEspecialidad || 'N/A'],
  ];

  if (evolucion.observacionesGenerales) {
    consultaData.push([{ content: 'Observaciones Generales', colSpan: 1 }, { content: evolucion.observacionesGenerales, colSpan: 3 }]);
  }

  autoTable(doc, {
    startY: yPos,
    body: consultaData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: COLORS.tableRowEven, cellWidth: 35 },
      1: { cellWidth: 'auto' },
      2: { fontStyle: 'bold', fillColor: COLORS.tableRowEven, cellWidth: 35 },
      3: { cellWidth: 'auto' },
    },
    margin: { left: 15, right: 15 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 8;

  // Motivo de Atención
  if (evolucion.motivoAtencion) {
    doc.setFontSize(10);
    doc.setFont(FONTS.bold, 'bold');
    doc.text('MOTIVO DE CONSULTA Y ENFERMEDAD ACTUAL', 15, yPos);
    yPos += 5;

    const motivoData = [
      [{ content: 'Motivo de Consulta', styles: { fontStyle: 'bold' } }, evolucion.motivoAtencion.motivoConsulta || 'N/A'],
    ];

    if (evolucion.motivoAtencion.enfermedadActual) {
      motivoData.push([
        { content: 'Síntomas / Enfermedad Actual', styles: { fontStyle: 'bold' } },
        evolucion.motivoAtencion.enfermedadActual
      ]);
    }

    autoTable(doc, {
      startY: yPos,
      body: motivoData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 45, fillColor: COLORS.tableRowEven },
        1: { cellWidth: 'auto' },
      },
      margin: { left: 15, right: 15 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 8;
  }

  return yPos;
}

/**
 * Add vital signs section
 */
function addVitalSignsSection(doc: jsPDF, signosVitales: any, yPos: number): number {
  doc.setFontSize(12);
  doc.setFont(FONTS.bold, 'bold');
  doc.setTextColor(COLORS.primaryDark);
  doc.text('3. SIGNOS VITALES', 15, yPos);
  yPos += 6;

  const signosData = [
    [
      'FC (lpm)',
      signosVitales.frecuenciaCardiaca?.toString() || '-',
      'PA (mmHg)',
      `${signosVitales.presionArterialSistolica || '-'}/${signosVitales.presionArterialDiastolica || '-'}`,
      'Temp (°C)',
      signosVitales.temperatura?.toString() || '-'
    ],
    [
      'FR (/min)',
      signosVitales.frecuenciaRespiratoria?.toString() || '-',
      'Sat O₂ (%)',
      signosVitales.saturacionOxigeno?.toString() || '-',
      'Glucosa',
      signosVitales.glucosa?.toString() || '-'
    ],
    [
      'Peso (kg)',
      signosVitales.peso?.toString() || '-',
      'Talla (cm)',
      signosVitales.talla?.toString() || '-',
      'IMC',
      signosVitales.imc?.toFixed(2) || '-'
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    body: signosData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      halign: 'center',
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: COLORS.tableRowEven },
      2: { fontStyle: 'bold', fillColor: COLORS.tableRowEven },
      4: { fontStyle: 'bold', fillColor: COLORS.tableRowEven },
    },
    margin: { left: 15, right: 15 },
  });

  return (doc as any).lastAutoTable.finalY + 8;
}

/**
 * Add clinical assessment (antecedentes + examen físico)
 */
function addClinicalAssessmentSection(doc: jsPDF, evolucion: any, yPos: number): number {
  // Antecedentes
  if (evolucion.antecedentesIncidente) {
    doc.setFontSize(12);
    doc.setFont(FONTS.bold, 'bold');
    doc.setTextColor(COLORS.primaryDark);
    doc.text('4. ANTECEDENTES', 15, yPos);
    yPos += 6;

    const antecedentesData: any[] = [];
    const ant = evolucion.antecedentesIncidente;

    if (ant.antecedentesPersonales) {
      antecedentesData.push(['Personales', ant.antecedentesPersonales]);
    }
    if (ant.antecedentesFamiliares) {
      antecedentesData.push(['Familiares', ant.antecedentesFamiliares]);
    }
    if (ant.alergias) {
      antecedentesData.push(['Alergias', ant.alergias]);
    }
    if (ant.habitosToxicos) {
      antecedentesData.push(['Hábitos Tóxicos', ant.habitosToxicos]);
    }
    if (ant.medicamentosActuales) {
      antecedentesData.push(['Medicamentos Actuales', ant.medicamentosActuales]);
    }

    if (antecedentesData.length > 0) {
      autoTable(doc, {
        startY: yPos,
        body: antecedentesData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: COLORS.tableRowEven, cellWidth: 40 },
          1: { cellWidth: 'auto' },
        },
        margin: { left: 15, right: 15 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // Examen Físico
  if (evolucion.valoracionClinica) {
    yPos = checkAndAddPage(doc, yPos, 50);

    doc.setFontSize(12);
    doc.setFont(FONTS.bold, 'bold');
    doc.setTextColor(COLORS.primaryDark);
    doc.text('5. EXAMEN FÍSICO', 15, yPos);
    yPos += 6;

    const examData: any[] = [];
    const val = evolucion.valoracionClinica;

    if (val.inspeccionGeneral) examData.push(['Inspección General', val.inspeccionGeneral]);
    if (val.cabezaCuello) examData.push(['Cabeza y Cuello', val.cabezaCuello]);
    if (val.torax) examData.push(['Tórax', val.torax]);
    if (val.abdomen) examData.push(['Abdomen', val.abdomen]);
    if (val.extremidades) examData.push(['Extremidades', val.extremidades]);
    if (val.neurologico) examData.push(['Neurológico', val.neurologico]);
    if (val.pielTegumentos) examData.push(['Piel y Tegumentos', val.pielTegumentos]);
    if (val.otrosHallazgos) examData.push(['Otros Hallazgos', val.otrosHallazgos]);

    if (examData.length > 0) {
      autoTable(doc, {
        startY: yPos,
        body: examData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: COLORS.tableRowEven, cellWidth: 40 },
          1: { cellWidth: 'auto' },
        },
        margin: { left: 15, right: 15 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  return yPos;
}

/**
 * Add diagnostics section
 */
function addDiagnosticsSection(doc: jsPDF, diagnosticos: any[], yPos: number): number {
  doc.setFontSize(12);
  doc.setFont(FONTS.bold, 'bold');
  doc.setTextColor(COLORS.primaryDark);
  doc.text('6. DIAGNÓSTICOS (CIE-10)', 15, yPos);
  yPos += 6;

  const diagnosticoData = diagnosticos.map(d => [
    d.codigoCie || '-',
    d.diagnostico,
    d.tipo || '-',
    d.observaciones || '-'
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Código CIE', 'Diagnóstico', 'Tipo', 'Observaciones']],
    body: diagnosticoData,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.tableHeader,
      textColor: COLORS.white,
      fontSize: 9,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 30 },
      3: { cellWidth: 50 },
    },
    margin: { left: 15, right: 15 },
  });

  return (doc as any).lastAutoTable.finalY + 8;
}

/**
 * Add treatment plans section
 */
function addTreatmentSection(doc: jsPDF, planes: any[], yPos: number): number {
  doc.setFontSize(12);
  doc.setFont(FONTS.bold, 'bold');
  doc.setTextColor(COLORS.primaryDark);
  doc.text('7. PLAN DE TRATAMIENTO', 15, yPos);
  yPos += 6;

  planes.forEach((plan, index) => {
    yPos = checkAndAddPage(doc, yPos, 30);

    // Plan header
    doc.setFontSize(10);
    doc.setFont(FONTS.bold, 'bold');
    doc.text(`${index + 1}. ${plan.nombreTratamiento}`, 15, yPos);
    
    if (plan.descripcion) {
      yPos += 5;
      doc.setFontSize(8);
      doc.setFont(FONTS.normal, 'normal');
      doc.text(`   ${plan.descripcion}`, 15, yPos);
    }

    yPos += 5;

    // Medicamentos
    if (plan.indicacionesMedicas && plan.indicacionesMedicas.length > 0) {
      const medicamentosData = plan.indicacionesMedicas.map((ind: any) => [
        ind.medicamento,
        ind.dosis,
        ind.frecuencia,
        ind.viaAdministracion,
        ind.duracion,
        ind.indicacionesEspeciales || '-'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Medicamento', 'Dosis', 'Frecuencia', 'Vía', 'Duración', 'Indicaciones']],
        body: medicamentosData,
        theme: 'grid',
        headStyles: {
          fillColor: COLORS.tableHeader,
          textColor: COLORS.white,
          fontSize: 8,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 7,
          cellPadding: 2,
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 20 },
          2: { cellWidth: 25 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 'auto' },
        },
        margin: { left: 20, right: 15 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 6;
    }
  });

  return yPos;
}

/**
 * Add requested exams section
 */
function addExamsSection(doc: jsPDF, examenes: any[], yPos: number): number {
  doc.setFontSize(12);
  doc.setFont(FONTS.bold, 'bold');
  doc.setTextColor(COLORS.primaryDark);
  doc.text('8. EXÁMENES SOLICITADOS', 15, yPos);
  yPos += 6;

  const examenesData = examenes.map(ex => [
    ex.tipoExamen || '-',
    ex.nombreExamen,
    ex.urgencia || '-',
    ex.indicaciones || '-'
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Tipo', 'Examen', 'Urgencia', 'Indicaciones']],
    body: examenesData,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.tableHeader,
      textColor: COLORS.white,
      fontSize: 9,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 25 },
      3: { cellWidth: 50 },
    },
    margin: { left: 15, right: 15 },
  });

  return (doc as any).lastAutoTable.finalY + 8;
}

/**
 * Add discharge information section
 */
function addDischargeSection(doc: jsPDF, alta: any, yPos: number): number {
  doc.setFontSize(12);
  doc.setFont(FONTS.bold, 'bold');
  doc.setTextColor(COLORS.primaryDark);
  doc.text('9. ALTA MÉDICA', 15, yPos);
  yPos += 6;

  const altaData = [
    ['Fecha Alta', alta.fechaAlta ? formatDateTime(alta.fechaAlta) : 'N/A', 'Tipo Alta', alta.tipoAlta || 'N/A'],
    ['Condición al Alta', alta.condicionAlta || 'N/A', 'Especialidad Control', alta.especialidadControl || 'N/A'],
  ];

  if (alta.controlProgramado) {
    altaData.push(['Control Programado', formatDate(alta.controlProgramado), '', '']);
  }

  if (alta.recomendaciones) {
    altaData.push([{ content: 'Recomendaciones', colSpan: 1 }, { content: alta.recomendaciones, colSpan: 3 }]);
  }

  autoTable(doc, {
    startY: yPos,
    body: altaData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: COLORS.tableRowEven, cellWidth: 40 },
      1: { cellWidth: 'auto' },
      2: { fontStyle: 'bold', fillColor: COLORS.tableRowEven, cellWidth: 40 },
      3: { cellWidth: 'auto' },
    },
    margin: { left: 15, right: 15 },
  });

  return (doc as any).lastAutoTable.finalY + 8;
}

/**
 * Generate a descriptive filename for the PDF
 */
function generateFileName(data: FullClinicalRecordResponse): string {
  const numeroHC = data.historiaClinica.numeroHistoriaClinica;
  const apellido = data.paciente.apellidoPaterno || 'Paciente';
  const nombre = data.paciente.primerNombre || '';

  // Sanitize for filename (remove special characters)
  const sanitize = (str: string) => str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  return `HC_${numeroHC}_${sanitize(apellido)}_${sanitize(nombre)}.pdf`;
}

/**
 * Format date to Spanish locale
 */
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return dateString;
  }
}

/**
 * Format date and time to Spanish locale
 */
function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}
