# MI LIBERTAD FINANCIERA — SISTEMA PERSONAL DE GESTIÓN DE DEUDAS

Aplicación web Full Stack de alto nivel diseñada para gestionar deudas personales, controlar cuotas fijas y rotativas, registrar abonos extraordinarios y visualizar de forma protagonista el camino hacia la deuda cero ($0 COP).

---

## 1. TECNOLOGÍAS UTILIZADAS

- **Framework:** Next.js 15 (App Router, Server & Client Components)
- **Lenguaje:** TypeScript
- **Estilos & Diseño:** Tailwind CSS (Paleta Dark Financial de alta gama: `#0B1120`, `#151F32`, verde esmeralda y rojo alerta)
- **Base de Datos:** MySQL 8 (`misdeudas` en `localhost:3306`)
- **ORM:** Prisma ORM 6 (Con transacciones atómicas `$transaction` e integridad referencial)
- **Visualización & Gráficos:** Recharts (Gráfico Donut dinámico central, distribución por acreedor y evolución temporal)
- **Iconografía:** Lucide React
- **Validaciones:** Zod
- **Formularios:** React Hook Form
- **Exportación:** SheetJS (`xlsx`) para Excel y `jspdf` / `jspdf-autotable` para PDF
- **Seguridad:** Tokens JWT firmados con `jose`, contraseñas hasheadas con `bcryptjs` y cookies HttpOnly

---

## 2. CARGA INICIAL DE LAS 5 OBLIGACIONES COMERCIALES

Los valores están rigurosamente cargados en la base de datos MySQL sin alteraciones automáticas:

| Obligación | Monto Inicial / Saldo Vivo | Plan Cuotas | Cuota Mensual | Mora Reportada | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NEQUI** | $2.694.907 | 48 totales (17 previas, 31 pend.) | $105.000 | 5 cuotas ($749.507) | EN MORA |
| **DAVIVIENDA** (Ref: A_1515290) | $4.291.384 | 24 totales (0 previas, 24 pend.) | $178.808 | 1 cuota ($178.808) | EN MORA |
| **CRÉDITO 20 MINUTOS** | $2.664.701 | 24 totales (7 previas, 17 pend.) | $148.148 | 12 cuotas ($1.957.071) | EN MORA |
| **NU** | $218.628 | Rotativo libre (Sin cuota fija) | $0 | $0 | ACTIVA |
| **TARJETA DE CRÉDITO DAVIBANK** | $4.514.000 | Rotativo libre (Sin cuota fija) | $0 | $0 | ACTIVA |
| **TOTAL INICIAL** | **$14.383.620 COP** | — | — | — | **Progreso: 0%** |

---

## 3. ARQUITECTURA FINANCIERA & REGLAS OBLIGATORIAS

1. **Única Fuente de Verdad:** El saldo de cada deuda no se calcula multiplicando cuotas pendientes, sino mediante la fórmula inmutable:
   $$\text{Saldo Pendiente} = \text{Saldo Inicial Conciliado} - \text{Pagos Netos Confirmados}$$
2. **Transacciones Atómicas:** Cada pago de cuota o abono se ejecuta en una transacción SQL con Prisma (`$transaction`). Si alguna validación falla, se aborta la operación completa evitando inconsistencias.
3. **Flujo de Cuotas Estricto:** Al hacer clic en una cuota, el sistema abre un modal de confirmación, registra el movimiento financiero en base de datos, actualiza la cuota a `PAGADA`, descuenta el saldo pendiente y actualiza inmediatamente el gráfico Donut central.
4. **Reversión Auditable:** Si se comete un error, no se borran datos silenciosamente; se genera un contra-movimiento de tipo `REVERSION_PAGO`, se restaura el saldo de la deuda y la cuota vuelve a su estado pendiente o en mora.
5. **Abonos Personalizables:** Permite abonos a capital, cobertura directa de cuotas vencidas o adelantamiento de cuotas futuras.

---

## 4. INSTALACIÓN Y PUESTA EN MARCHA LOCAL

### Requisitos Previos:
- Node.js v18+ o v24+
- Servidor MySQL 8 corriendo en `localhost:3306` con usuario `root` y clave `root`

### Pasos:

1. **Clonar o ubicarse en el directorio del proyecto:**
   ```powershell
   cd "c:\Informacion David\Desarrollo\misdeudas"
   ```

2. **Verificar variables de entorno (`.env`):**
   ```env
   DATABASE_URL="mysql://root:root@localhost:3306/misdeudas"
   APP_SECRET="mi_libertad_financiera_super_secret_key_2026_jwt"
   ```

3. **Sincronizar la base de datos MySQL con Prisma:**
   ```powershell
   npx prisma db push
   ```

4. **Ejecutar el Seed inicial con las 5 deudas exactas:**
   ```powershell
   npm run seed
   ```

5. **Iniciar el servidor de desarrollo:**
   ```powershell
   npm run dev
   ```
   O compilar para producción:
   ```powershell
   npm run build
   npm run start
   ```

6. **Abrir en el navegador:**
   - URL: `http://localhost:3000`
   - Credenciales de acceso:
     - **Email:** `david@milibertadfinanciera.com`
     - **Contraseña:** `admin123`

---

## 5. MÓDULOS DE LA APLICACIÓN

1. **Dashboard (`/`):**
   - **Gráfico Circular Donut Central:** Muestra en el centro el Saldo Total Pendiente ($14.383.620), Deuda Inicial y Progreso (0%). Se actualiza en tiempo real al registrar pagos o abonos.
   - **4 Tarjetas de KPIs:** Deuda Inicial, Total Pagado, Saldo Pendiente y Cuotas Activas / Mora.
   - **Gráfico de Distribución por Acreedor:** Porcentajes y saldos de Nequi, Davivienda, Crédito 20 minutos, Nu y Davibank.
   - **Barra de Progreso Horizontal:** 0% Inicio ━━━━━━━━ 100% Libre de Deudas.
2. **Gestión de Deudas (`/deudas`):**
   - Tarjetas completas de las 5 obligaciones con montos, cuotas, saldos, estados y opción de crear nuevas deudas o eliminar (con validación de seguridad financiera).
3. **Cuotas & Checklist (`/cuotas`):**
   - Lista interactiva numerada de cuotas para Nequi, Davivienda y Crédito 20 minutos.
   - Filtros por cuotas pendientes, vencidas (en mora) o pagadas.
   - Modal de confirmación y registro en un clic.
4. **Registrar Abonos (`/abonos`):**
   - Amortizaciones libres para Nu y Tarjeta de Crédito Davibank o abonos extraordinarios a créditos fijos.
   - Selección de destino: Reducir capital, Cubrir mora o Adelantar cuotas.
5. **Historial Financiero (`/historial`):**
   - Tabla con todos los movimientos auditados: fecha, acreedor, valor, método, comprobante y saldos anterior/posterior.
   - Botón de **Reversión Auditable** con motivo obligatorio.
   - Exportación con un solo clic a **Excel (.xlsx)** y **PDF (.pdf)**.
6. **Proyección & Reportes (`/reportes`):**
   - Simulador interactivo del **Método Bola de Nieve**.
   - Control deslizante para calcular meses ahorrados y fecha exacta de libertad financiera al aumentar abonos mensuales extraordinarios.
   - Gráfico de trayectoria de deuda comparando plan normal vs acelerado.
