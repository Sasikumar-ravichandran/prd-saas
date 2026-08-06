// MASTER DICTIONARY OF SUPPORTED WHATSAPP EVENTS
export const AVAILABLE_EVENTS = [
  {
    id: 'appointment_booked',
    title: 'Patient: Appointment Confirmation',
    desc: 'Sends instantly when an appointment is booked.',
    variables: ['{{patientName}}', '{{time}}', '{{treatment}}', '{{doctorName}}', '{{clinicName}}']
  },
  {
    id: 'appointment_rescheduled',
    title: 'Patient: Appointment Rescheduled',
    desc: 'Sends when the date or time of an appointment is changed.',
    variables: ['{{patientName}}', '{{time}}', '{{doctorName}}', '{{clinicName}}']
  },
  {
    id: 'appointment_cancelled',
    title: 'Patient: Cancellation Notice',
    desc: 'Sends when an appointment is deleted or marked as Cancelled.',
    variables: ['{{patientName}}', '{{time}}', '{{clinicName}}']
  },
  {
    id: 'appointment_completed',
    title: 'Patient: Post-Treatment Thank You',
    desc: 'Sends when an appointment status is marked as Completed.',
    variables: ['{{patientName}}', '{{treatment}}', '{{clinicName}}']
  },
  {
    id: 'appointment_reminder',
    title: 'Patient: 24-Hour Reminder (Automated)',
    desc: 'Sends exactly 24 hours before the scheduled time.',
    variables: ['{{patientName}}', '{{time}}', '{{clinicName}}']
  },
  {
    id: 'payment_received',
    title: 'Patient: Payment Receipt',
    desc: 'Sends instantly when a payment is recorded.',
    variables: ['{{patientName}}', '{{amount}}', '{{receiptNumber}}', '{{method}}', '{{clinicName}}']
  }
];

export const ADMIN = 'Administrator'