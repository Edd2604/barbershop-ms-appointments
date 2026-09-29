# BarberShop · Microservicio de Citas

El corazón del negocio: reserva de citas, disponibilidad de barberos y el ciclo
de vida de cada cita desde que se pide hasta que se completa o se cancela.

Arranca como microservicio TCP y no expone HTTP. Pero, a diferencia de los
demás, **este sí habla con sus vecinos**: consulta a usuarios y a servicios para
validar lo que le mandan, y le pide a pagos que registre el cobro.

```
Gateway ──TCP──▶ ms-appointments ──┬──▶ ms-users     (get-customer-by-id, get-barber-by-id)
                                   ├──▶ ms-services  (get-service-by-id)
                                   └──▶ ms-payments  (create-payment, change-payment-status)
```

## El ciclo de vida de una cita

`AppointmentStatus` no es una etiqueta suelta, es una máquina de estados, y cada
transición tiene su propio patrón de mensaje:

```
                  ┌──▶ RECHAZADA        (reject-appointment)
   PENDIENTE ─────┤
                  └──▶ CONFIRMADA ──▶ EN_PROCESO ──▶ COMPLETADA
                       (confirm)        (start)        (complete)
                            │
                            └──▶ CANCELADA            (cancel)
```

Modelar los estados así —en lugar de un booleano `atendida`— es lo que permite
saber en qué punto se cayó una cita y sacar métricas reales de cuántas se
rechazan o se cancelan.

## Una decisión que vale la pena explicar

El modelo `Appointment` guarda **el id y el nombre** de cliente, barbero y
servicio:

```prisma
customerId   Int
customerName String
barberId     Int
barberName   String
serviceId    Int
serviceName  String
```

Parece redundante, y en un monolito lo sería. Aquí no: cada microservicio tiene
su propia base de datos, así que **no existe el JOIN**. Sin esa copia, listar
cien citas obligaría a lanzar trescientas llamadas TCP para resolver los
nombres.

La copia se hace al crear la cita —por eso se consulta a `ms-users` y
`ms-services` en ese momento— y es un cambio consciente: se gana velocidad de
lectura a cambio de que un nombre editado después no se refleje en las citas
viejas. Para un historial, eso es incluso lo correcto.

## Qué atiende

20 patrones de mensaje:

```
ciclo de vida   create-appointment · create-appointment-by-admin
                confirm-appointment · reject-appointment · start-appointment
                complete-appointment · cancel-appointment
                update-appointment · remove-appointment
consultas       get-all-appointments · get-appointment-by-id
                get-appointments-by-barber · get-appointments-by-customer
                get-appointments-by-day · get-appointments-today
                get-appointments-request · get-available-appointments
métricas        get-top-barbers · get-top-customers · get-top-services
```

`get-available-appointments` es el que resuelve la disponibilidad: cruza el
horario del barbero con las citas ya reservadas para devolver los huecos libres.

## Stack

NestJS · TypeScript · `@nestjs/microservices` (TCP) · Prisma · PostgreSQL ·
class-validator y class-transformer · Joi · Luxon y date-fns para el manejo de
horarios

## Cómo levantarlo

```bash
npm install
npx prisma migrate dev
npm run start:dev
```

El `.env` necesita su puerto, su base de datos y **la dirección de los tres
microservicios con los que habla**:

```
PORT=
DATABASE_URL=
USERS_MS_HOST=      USERS_MS_PORT=
SERVICES_MS_HOST=   SERVICES_MS_PORT=
PAYMENTS_MS_HOST=   PAYMENTS_MS_PORT=
```

Otros comandos: `npm run build`, `npm run start:prod`, `npm run lint`,
`npm run format`, `npm test`.

## El resto del sistema

| Repositorio | Qué hace |
|---|---|
| [barbershop-frontend](https://github.com/Edd2604/barbershop-frontend) | Interfaz web en Next.js |
| [barbershop-gateway](https://github.com/Edd2604/barbershop-gateway) | Entrada única: autentica, valida y enruta |
| [barbershop-ms-users](https://github.com/Edd2604/barbershop-ms-users) | Usuarios y clientes |
| [barbershop-ms-services](https://github.com/Edd2604/barbershop-ms-services) | Catálogo de servicios y productos |
| [barbershop-ms-payments](https://github.com/Edd2604/barbershop-ms-payments) | Pagos |
| [barbershop-ms-analytics](https://github.com/Edd2604/barbershop-ms-analytics) | Métricas del negocio |

---
