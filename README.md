# TODO App

Tiempo de desarrollo (aprox): 01:20:00. Para correr la app

```bash
docker compose up -d --build
```

Luego ir a localhost:8080

## Decisiones

-  Definir el alcance del proyecto y la estructura
- Limitar el uso de librerias. Solo esta incluida la oficial para la db y las de hacer testing
- Guiar el proceso de implementación por etapas

## Qué haría con más tiempo?

Realmente depende de la complejidad del projecto. La respuesta honesta para este proyecto es que no hay mucho más para hacer relacionado con lo que se pidió. Si hablamos de nuevas funcionalidades, pues puede ir desde lo común como agregar authz hasta sustituir el clásico estilo basado en lista, filtro y formulario por un asistente donde la gestión de todos se haga a través de tool-call. Por lo pronto, me referiré a lo que haría en dependencia de la complejidad del proyecto:

- Crear skills específicas que garantizen el flujo de trabajo deseado
- Crear contexto por cada (sub) dominio
- Agregar integración continua y despliegue a cloud

## Uso de la IA

Usé OpenCode con algunas skill globales propias. El flujo fue el siguiente

1. Descripcion del alcance del proyecto y la estructura de la solución
2. Implementacion de la api, estableciendo postgres como la db
3. Implementacion del front, restringiendo el use de libs q no sean react
4. Olvide que por defecto no hay una suite test en los proyectos de react, asi que segui con la creación de pruebas. Un verdadero disparate xq debe ser al revés pero bueno, cosas que pasan
5. Dockerizar la solución
6. Ajustes en el layout

## Nota

El último commit relacionado con la corrección del enum de estados fue error mío al especificarlos
