Este código es el que utilizamos para añadir una marca de agua a las imágenes. Este codigo hace uso del programa imagick, el cual viene por defecto en las librerias de AWS pero que tal vez no esté instalado en nuestro servidor de PHP, por lo que habría que instalarlo.

Contenido:


/Serverless

Contiene el la información para el montaje en AWS

/Serverless/Lambdas

Servicio necesario para montarlo

/Serverless/Lambdas/Code

Codigo en NodeJs de las funciones usadas

/Serverless/Lambdas/SAM

Configuración de las lambdas (roles, variables de entorno,...)



/ServerBased

Contiene el codigo PHP de programa para añadir marca de agua

/ServerBased/Info.php

Devuele la información de las imagenes

/ServerBased/StartWatermark.php

Inicia y hace el proceso de añadir las marcas de agua