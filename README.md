# MoodMap

> Encuentra lugares donde te sientas cómodo.

## 1. Descripción del proyecto

MoodMap es una aplicación web y móvil orientada a mejorar la accesibilidad sensorial de las personas con autismo, hipersensibilidad sensorial u otras necesidades relacionadas con los estímulos del entorno.

Su objetivo es permitir que cualquier persona pueda consultar cómo es el ambiente de un establecimiento antes de visitarlo, teniendo en cuenta factores como:

- Nivel de ruido.
- Intensidad de la iluminación.
- Nivel de aglomeración.

La aplicación también permitirá que los usuarios compartan sus propias experiencias, valoren establecimientos y consulten los horarios en los que suele haber menos estímulos.

La idea principal es que las personas puedan planificar sus salidas con mayor tranquilidad y autonomía.

## 2. Objetivos principales

1. Facilitar la búsqueda de establecimientos con ambientes tranquilos.
2. Proporcionar información sobre las condiciones sensoriales de cada lugar.
3. Crear una comunidad donde los usuarios puedan compartir experiencias.
4. Reducir la información falsa o desactualizada mediante un sistema de fiabilidad.
5. Mostrar horarios recomendados para visitar cada establecimiento.
6. Crear una interfaz sencilla, intuitiva y accesible.

## 3. Público objetivo

La aplicación está especialmente dirigida a:

- Personas con autismo.
- Personas con hipersensibilidad auditiva o visual.
- Personas con dificultades para gestionar ambientes con muchos estímulos.
- Familiares y acompañantes.
- Cualquier persona que prefiera visitar lugares tranquilos.

Aunque está pensada principalmente para personas con necesidades sensoriales, cualquier usuario podrá utilizarla.

## 4. Tecnologías

Utilizaremos las siguientes tecnologías:

### Frontend
- Angular.
- TypeScript.
- HTML5.
- CSS3.

### Backend y base de datos
- Supabase.
- PostgreSQL.
- Supabase Auth para la autenticación.
- Supabase Storage si necesitamos almacenar imágenes.

### Herramientas
- Visual Studio Code.
- Git y GitHub.
- Google Maps, OpenStreetMap o una alternativa de mapas.
- Vercel para desplegar la aplicación web.

Priorizar herramientas gratuitas siempre que sea posible.

## 5. Diseño y experiencia de usuario

La aplicación debe tener un diseño moderno, limpio y sencillo.

Es especialmente importante que sea accesible y que no genere una sobrecarga visual.

### Principios de diseño

- Interfaz minimalista.
- Navegación sencilla.
- Textos fáciles de entender.
- Buena separación entre elementos.
- Contraste suficiente entre texto y fondo.
- Iconos reconocibles acompañados de texto.
- Evitar animaciones innecesarias.
- No utilizar colores excesivamente brillantes.
- Diseño responsive para móviles, tablets y ordenadores.

Los usuarios deben poder entender rápidamente cómo funciona la aplicación sin necesitar instrucciones complejas.

### Identidad visual

Nombre: MoodMap.

La identidad visual debe transmitir tranquilidad, confianza y accesibilidad.

Se puede utilizar una paleta de colores suaves, con tonos azulados, verdes o neutros.

Evitar que la interfaz parezca una aplicación médica. Debe sentirse como una aplicación cotidiana para descubrir lugares.

## 6. Funcionalidades principales

### 6.1. Mapa de establecimientos

Será la pantalla principal de la aplicación.

Mostrará los establecimientos cercanos mediante marcadores en un mapa.

Cada establecimiento tendrá información visual sobre sus condiciones sensoriales.

Filtros disponibles:

- Ruido: bajo, medio y alto.
- Iluminación: baja, media y alta.
- Aglomeración: baja, media y alta.
- Tipo de establecimiento.

Tipos de establecimientos iniciales:

- Restaurantes.
- Cafeterías.
- Bibliotecas.
- Parques.
- Museos.
- Tiendas.
- Otros espacios públicos.

Al seleccionar un marcador se mostrará un resumen del establecimiento y se podrá acceder a su ficha completa.

También debe existir una alternativa de visualización en forma de lista para las personas que prefieran no utilizar el mapa.

### 6.2. Ficha de establecimiento

Cada establecimiento tendrá una página propia.

Información que debe mostrar:

- Nombre.
- Fotografía, si está disponible.
- Dirección.
- Tipo de establecimiento.
- Valoración sensorial general.
- Nivel de ruido.
- Nivel de iluminación.
- Nivel de aglomeración.
- Horarios recomendados.
- Número de valoraciones.
- Fecha de la última actualización.

Los niveles sensoriales deben representarse de manera visual y fácil de interpretar.

Por ejemplo:

- Ruido: bajo.
- Iluminación: media.
- Aglomeración: baja.

También se incluirá un apartado con las experiencias y comentarios de otros usuarios.

### 6.3. Valoraciones comunitarias

Los usuarios podrán añadir valoraciones sobre los establecimientos.

Cada valoración incluirá:

- Nivel de ruido.
- Nivel de iluminación.
- Nivel de aglomeración.
- Día de la semana.
- Franja horaria.
- Comentario opcional.
- Fecha de publicación.

Es importante que las valoraciones representen la experiencia de una visita concreta y no necesariamente las condiciones permanentes del establecimiento.

Los usuarios también podrán confirmar si una valoración sigue siendo correcta.

### 6.4. Sistema de fiabilidad

Para evitar información falsa o poco fiable, se implementará un sistema comunitario de confirmación.

Funcionamiento inicial:

1. Un usuario publica una valoración.
2. Otros usuarios que visitan el establecimiento pueden confirmar si coincide con su experiencia.
3. Las valoraciones confirmadas aumentan su fiabilidad.
4. Las valoraciones antiguas deben perder relevancia progresivamente.

La fiabilidad debe tener en cuenta:

- Número de confirmaciones.
- Antigüedad de la valoración.
- Número de valoraciones disponibles.
- Coincidencia entre experiencias recientes.

No se debe presentar una valoración como información objetiva o garantizada.

### 6.5. Horarios recomendados

La aplicación mostrará las franjas horarias en las que un establecimiento suele tener menos estímulos.

Por ejemplo:

| Horario | Ruido | Aglomeración |
|---|---|---|
| 09:00 - 11:00 | Bajo | Baja |
| 12:00 - 14:00 | Alto | Alta |
| 16:00 - 18:00 | Medio | Baja |
| 19:00 - 21:00 | Alto | Alta |

Estos datos se obtendrán de las valoraciones de los usuarios.

Es importante mostrar cuándo hay suficientes datos y cuándo una recomendación se basa en pocas experiencias.

## 7. Usuarios y autenticación

La aplicación permitirá utilizar algunas funcionalidades sin registrarse, como consultar establecimientos.

Para participar en la comunidad será necesario iniciar sesión.

Funcionalidades de usuario:

- Registrarse.
- Iniciar sesión.
- Cerrar sesión.
- Consultar establecimientos.
- Publicar valoraciones.
- Confirmar valoraciones de otros usuarios.
- Consultar sus propias aportaciones.

Utilizar Supabase Auth para gestionar las cuentas.

No almacenar contraseñas directamente en la base de datos.

## 8. Base de datos

Utilizar PostgreSQL mediante Supabase.

Se propone inicialmente la siguiente estructura:

### Tabla: profiles

Información pública de los usuarios.

- id: UUID, relacionado con auth.users.
- username: nombre de usuario.
- avatar_url: imagen de perfil opcional.
- created_at: fecha de creación.

### Tabla: places

Información de los establecimientos.

- id: UUID.
- name: nombre.
- description: descripción.
- address: dirección.
- latitude: latitud.
- longitude: longitud.
- category: categoría.
- image_url: imagen opcional.
- created_at: fecha de creación.

### Tabla: reviews

Valoraciones de los establecimientos.

- id: UUID.
- place_id: establecimiento relacionado.
- user_id: usuario que publica.
- noise_level: nivel de ruido.
- lighting_level: nivel de iluminación.
- crowd_level: nivel de aglomeración.
- day_of_week: día de la semana.
- time_slot: franja horaria.
- comment: comentario opcional.
- created_at: fecha de publicación.

### Tabla: review_confirmations

Confirmaciones de valoraciones.

- id: UUID.
- review_id: valoración relacionada.
- user_id: usuario que confirma.
- created_at: fecha de confirmación.

Cada usuario solo podrá confirmar una vez cada valoración.

La estructura puede ampliarse cuando sea necesario.

## 9. Seguridad

Configurar correctamente Supabase y sus políticas RLS (Row Level Security).

Reglas iniciales:

- Cualquier visitante podrá consultar establecimientos y valoraciones públicas.
- Solo los usuarios autenticados podrán publicar valoraciones.
- Cada usuario podrá modificar o eliminar sus propias valoraciones.
- Cada usuario solo podrá gestionar su propio perfil.
- No se permitirán confirmaciones duplicadas.
- Las claves privadas de Supabase nunca deben aparecer en el frontend.

## 10. Estructura de pantallas

La primera versión tendrá las siguientes pantallas:

### 1. Inicio / Mapa

- Barra de navegación.
- Buscador de establecimientos.
- Mapa interactivo.
- Filtros sensoriales.
- Acceso a la vista de lista.
- Establecimientos cercanos.

### 2. Detalle del establecimiento

- Información general.
- Niveles sensoriales.
- Horarios recomendados.
- Valoraciones de usuarios.
- Botón para añadir una valoración.

### 3. Añadir valoración

Formulario sencillo con:

- Selección del establecimiento.
- Nivel de ruido.
- Nivel de iluminación.
- Nivel de aglomeración.
- Día y hora de la visita.
- Comentario opcional.
- Botón para publicar.

### 4. Inicio de sesión y registro

Formularios sencillos para crear una cuenta e iniciar sesión.

### 5. Perfil de usuario

- Nombre de usuario.
- Valoraciones publicadas.
- Información de la cuenta.
- Cerrar sesión.

## 11. Funcionamiento de ejemplo

Una persona con hipersensibilidad auditiva quiere ir a una cafetería.

1. Abre MoodMap.
2. Consulta el mapa de establecimientos cercanos.
3. Activa el filtro de ruido bajo.
4. Compara varias cafeterías.
5. Entra en la ficha de una de ellas.
6. Comprueba sus niveles sensoriales y horarios recomendados.
7. Decide visitarla en una franja horaria más tranquila.

Después de su visita puede publicar una valoración para ayudar a otros usuarios.

## 12. Viabilidad y alcance

El proyecto se desarrollará como prototipo funcional para el Hackathon de 2.º DAM.

El objetivo es implementar una versión inicial que permita demostrar las funcionalidades principales.

Se priorizará:

1. Diseño de la interfaz.
2. Mapa con establecimientos.
3. Consulta de fichas.
4. Sistema de valoraciones.
5. Autenticación.
6. Confirmación y fiabilidad de valoraciones.
7. Horarios recomendados.

El coste estimado del prototipo es de aproximadamente 0 €, utilizando los planes gratuitos de las herramientas seleccionadas y respetando sus límites.

## 13. Desarrollo por fases

### Fase 1: Preparación

- Crear el proyecto Angular.
- Configurar TypeScript.
- Preparar la estructura de carpetas.
- Configurar Supabase.
- Crear las tablas iniciales.

### Fase 2: Interfaz

- Crear la navegación.
- Diseñar el mapa principal.
- Crear las fichas de establecimientos.
- Crear los formularios.
- Adaptar el diseño a móviles.

### Fase 3: Funcionalidad

- Conectar Angular con Supabase.
- Implementar autenticación.
- Consultar establecimientos.
- Publicar valoraciones.
- Confirmar valoraciones.

### Fase 4: Mejoras

- Implementar filtros.
- Calcular niveles sensoriales generales.
- Crear horarios recomendados.
- Implementar el sistema de fiabilidad.
- Revisar accesibilidad y responsive.

### Fase 5: Pruebas y publicación

- Probar todas las funcionalidades.
- Corregir errores.
- Comprobar el funcionamiento en móviles.
- Desplegar la aplicación.

## 14. Valor diferencial

MoodMap no se centra únicamente en la accesibilidad física de los establecimientos, sino también en la accesibilidad sensorial.

Permite conocer de antemano cómo puede ser el ambiente de un lugar y elegir cuándo visitarlo.

Su principal valor es combinar información sensorial, experiencias de otros usuarios y horarios recomendados en una misma aplicación.

## 15. Indicadores de éxito

Para comprobar la utilidad del proyecto se podrán medir:

- Número de establecimientos registrados.
- Número de valoraciones publicadas.
- Número de valoraciones confirmadas.
- Número de usuarios registrados.
- Número de establecimientos con información actualizada.

---

# INSTRUCCIONES PARA EL DESARROLLO

Este documento es el contexto general del proyecto. Debes utilizarlo como referencia durante todo el desarrollo.

- Desarrolla el proyecto de forma progresiva.
- No intentes implementar todas las funcionalidades de golpe.
- Prioriza que las funcionalidades existentes funcionen correctamente.
- Mantén el código organizado y fácil de entender.
- Utiliza TypeScript y Angular correctamente.
- Evita código innecesariamente complejo.
- No introduzcas dependencias que no sean necesarias.
- Separa los componentes, servicios y modelos.
- Utiliza Supabase para almacenar los datos reales.
- No utilices datos falsos como sustituto permanente de la base de datos.
- Si necesitas datos de prueba, crea datos claramente identificados como tales.
- Comprueba el funcionamiento en dispositivos móviles.
- Mantén la accesibilidad como una prioridad durante todo el desarrollo.

**IMPORTANTE:** No empieces implementando todo a la vez. Primero analiza el proyecto y prepara su estructura. Después desarrolla las funcionalidades por fases, comprobando que cada una funciona antes de continuar.

El resultado debe ser un prototipo funcional, visualmente atractivo, intuitivo y fácil de utilizar.