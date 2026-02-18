# INSTRUCCIONES PARA CONFIGURAR VARIABLES DE ENTORNO EN VERCEL

## Paso 1: Acceder a tu proyecto en Vercel
1. Ve a https://vercel.com
2. Selecciona tu proyecto "quinta-calendar-pro-main"
3. Ve a **Settings** → **Environment Variables**

## Paso 2: Agregar las siguientes variables

### Variable 1: VITE_APPS_SCRIPT_URL
- **Name**: `VITE_APPS_SCRIPT_URL`
- **Value**: `https://script.google.com/macros/s/AKfycbwxk-EnB4iQZ2ZOrlkPa42CdNiJcBmDtWj8b2Nmzk4VG3OaxWbgTZ8OEV1Wi0KjAawZBg/exec`
- **Environment**: Production, Preview, Development (seleccionar todos)

### Variable 2: VITE_CLOUDINARY_CLOUD_NAME
- **Name**: `VITE_CLOUDINARY_CLOUD_NAME`
- **Value**: `dxkvxnyqp`
- **Environment**: Production, Preview, Development (seleccionar todos)

### Variable 3: VITE_CLOUDINARY_UPLOAD_PRESET
- **Name**: `VITE_CLOUDINARY_UPLOAD_PRESET`
- **Value**: `quinta_comprobantes`
- **Environment**: Production, Preview, Development (seleccionar todos)

## Paso 3: Guardar y Redesplegar
1. Haz clic en **Save** para cada variable
2. Después de agregar todas las variables, haz clic en **Redeploy** o espera el próximo deployment

## IMPORTANTE: Seguridad
⚠️ Estas variables estarán protegidas en el servidor de Vercel
⚠️ No aparecerán en el código del navegador
⚠️ Los visitantes NO podrán ver estas credenciales en F12 o DevTools

## ¿Por qué es seguro?
- Las variables de entorno de Vite (VITE_*) se inyectan en tiempo de BUILD
- Se convierten en constantes hardcodeadas pero ofuscadas
- Terser las minifica y ofusca durante la compilación
- Los console.log que podrían exponer datos se eliminan automáticamente
- Los visitantes tienen F12 bloqueado

