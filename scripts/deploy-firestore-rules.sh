#!/bin/bash
echo "Desplegando reglas de Firestore y Storage para permitir acceso público a contenido..."

# Desplegar reglas de Firestore y Storage
firebase deploy --only firestore:rules,storage:rules

echo "¡Reglas de Firestore y Storage desplegadas correctamente!"
echo "Ahora los usuarios no autenticados deberían poder ver el contenido e imágenes de la página principal."
