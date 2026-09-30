# Parches para el agente (`RafGab/ai-lead-machine-demo`)

## 0001: recordatorios de cita y seguimiento automático

Un correo de recordatorio antes de la cita y hasta dos de seguimiento a quien dejó su correo y no agendó.
Apagado por defecto; solo webs reales (widget); sin duplicados; con baja. Documentación completa dentro del parche en
`docs/recordatorios-y-seguimiento.md`. Probado: 210 pruebas pasan (188 existentes + 22 nuevas) y el parche se aplica limpio sobre `master`.

### Cómo aplicarlo (PowerShell o Git Bash)
```
git clone https://github.com/RafGab/ai-lead-machine-demo
cd ai-lead-machine-demo
git checkout -b recordatorios-seguimiento
git am ..\PagesWeb\parches\ai-lead-machine-demo\0001-recordatorios-y-seguimiento.patch
python -m pip install -r requirements.txt pytest
python -m pytest
git push -u origin recordatorios-seguimiento
```
(Ajusta la ruta del parche a donde tengas este repositorio.)

### Cómo desplegarlo sin riesgo
1. En Render, despliega la rama `recordatorios-seguimiento` en **un servicio de prueba**, no en el de Acero Pulido.
2. Variables: `REMINDERS_ENABLED=1`, `SMTP_USER`, `SMTP_PASSWORD`, `ADMIN_KEY`, `PUBLIC_BASE_URL`, `SITE_URL`, `BUSINESS_NAME`, `COMERCIAL_EMAIL`.
3. Comprueba la vista previa, que no envía nada: `POST https://TU-BACKEND/admin/reminders/run?key=TU_ADMIN_KEY`.
4. Reserva una cita de prueba con tu propio correo y comprueba que llega el recordatorio.
5. Antes de activarlo en un cliente real, añade el aviso de privacidad (ver la documentación).

### Si prefieres que yo lo suba
Instala la app de GitHub de Claude en `RafGab/ai-lead-machine-demo`: https://github.com/apps/claude/installations/select_target
Con eso puedo subir la rama `claude/recordatorios-seguimiento` para que la revises y la fusiones tú.
