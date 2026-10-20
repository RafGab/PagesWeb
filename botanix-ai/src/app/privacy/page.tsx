import { getDictionary } from "@/lib/i18n/server";
import { PageHeader, Card } from "@/components/ui";

export const metadata = { title: "Privacidad" };

// Texto informativo base. Debe revisarlo un profesional jurídico antes del lanzamiento público
// (identidad del responsable, DPO si procede, base legal definitiva y encargados de tratamiento).
export default async function PrivacyPage() {
  const { locale } = await getDictionary();
  const es = locale === "es";
  return (
    <div className="fade-in max-w-3xl">
      <PageHeader title={es ? "Privacidad y uso de imágenes" : "Privacy & image use"} />
      <Card className="space-y-4 leading-relaxed">
        {es ? (
          <>
            <p><b>Qué datos tratamos:</b> correo, contraseña (solo su hash bcrypt), preferencias, ubicaciones aproximadas (coordenadas redondeadas a ~1 km), fotos que subes, resultados de análisis, plantas, diario, recordatorios y conversaciones con el asistente.</p>
            <p><b>Fotos:</b> al subirlas eliminamos todos los metadatos (incluida la ubicación GPS del EXIF), las redimensionamos y las guardamos en almacenamiento privado accesible solo para ti. Las fotos de análisis que no guardas en una planta se borran automáticamente a los 30 días (configurable).</p>
            <p><b>Inteligencia artificial:</b> solo si das tu consentimiento, las fotos y el contexto que escribes se envían al proveedor de IA configurado (por defecto, la API de Anthropic) para generar la identificación, el diagnóstico o el diseño. No enviamos tu correo ni tu nombre. Puedes retirar el consentimiento en tu perfil.</p>
            <p><b>Servicios externos de datos:</b> para el clima usamos Open-Meteo y para verificar nombres científicos GBIF; solo reciben coordenadas aproximadas o nombres de plantas, nunca datos personales.</p>
            <p><b>Tus derechos (RGPD):</b> desde tu perfil puedes descargar todos tus datos en JSON (portabilidad) y eliminar tu cuenta con todas sus fotos y registros (supresión). Para rectificación u oposición, contacta con el responsable del servicio.</p>
            <p><b>Responsabilidad:</b> las identificaciones y diagnósticos por imagen son orientativos. No consumas plantas ni apliques tratamientos basándote solo en ellos; los problemas graves pueden requerir análisis de laboratorio o asesoramiento profesional.</p>
            <p className="muted text-sm">Documento base pendiente de revisión jurídica antes del lanzamiento público.</p>
          </>
        ) : (
          <>
            <p><b>Data we process:</b> email, password (bcrypt hash only), preferences, approximate locations (coordinates rounded to ~1 km), photos you upload, analysis results, plants, journal, reminders and assistant conversations.</p>
            <p><b>Photos:</b> on upload we strip all metadata (including EXIF GPS), resize them and store them privately, visible only to you. Analysis photos not saved to a plant are deleted automatically after 30 days (configurable).</p>
            <p><b>AI:</b> only with your consent, photos and the context you type are sent to the configured AI provider (Anthropic API by default) to produce the identification, diagnosis or design. We never send your email or name. You can withdraw consent in your profile.</p>
            <p><b>External data services:</b> Open-Meteo for climate and GBIF for scientific-name checks; they only receive approximate coordinates or plant names, never personal data.</p>
            <p><b>Your rights (GDPR):</b> from your profile you can download all your data as JSON (portability) and delete your account with all photos and records (erasure).</p>
            <p><b>Liability:</b> image-based identifications and diagnoses are orientative. Do not eat plants or apply treatments based on them alone; serious problems may need lab analysis or professional advice.</p>
            <p className="muted text-sm">Base document pending legal review before public launch.</p>
          </>
        )}
      </Card>
    </div>
  );
}
