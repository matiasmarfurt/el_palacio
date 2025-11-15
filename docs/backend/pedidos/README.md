# 🛒 Feature Pedidos - Proyecto _El Palacio_

**Gestión de pedidos de clientes**, integrado al endpoint de pedidos en **PHP MVC Procedural**.  
Permite crear, listar, buscar y actualizar pedidos desde cualquier frontend JS mediante JSON.

---

## 🧩 ¿Qué hace?

Este feature agrega soporte completo de pedidos:

✔️ Permite crear pedidos con múltiples productos y calcular automáticamente el total.  
✔️ Permite listar todos los pedidos con información del usuario asociado.  
✔️ Permite obtener un pedido por ID o número de pedido.  
✔️ Permite buscar pedidos por número, usuario, email o estado.  
✔️ Permite actualizar el estado de un pedido (`recibido`, `preparacion`, `en_camino`, `entregado`, `cancelado`, `pendiente`).

---

## ⚙️ Funcionamiento general

1. **Crear pedido**

   - Se envía un `POST` con JSON que incluye:
     ```json
     {
       "id_usuario": 1,
       "direccion_entrega": "Calle 123",
       "telefono": "099999999",
       "notas": "Dejar en portería",
       "metodo_pago": "efectivo",
       "productos": [
         { "id_producto": 12, "cantidad": 2 },
         { "id_producto": 5, "cantidad": 1 }
       ]
     }
     ```
   - El backend calcula los totales y genera un número de pedido único (`PED-YYYYMMDD####`).
   - Retorna JSON con `id_pedido` y `numero_pedido`.

2. **Listar pedidos**

   - `GET /api/api_pedidos.php` devuelve todos los pedidos con información de usuario.
   - Se puede filtrar usando parámetros opcionales: `id`, `numero_pedido` o `buscar`.

3. **Actualizar estado del pedido**

   - `PUT /api/api_pedidos.php` con JSON que incluya:
     ```json
     { "id": 15, "estado": "entregado" }
     ```
   - Solo acepta estados válidos (`recibido`, `preparacion`, `en_camino`, `entregado`, `cancelado`, `pendiente`).

---

## 💻 Ejemplo de consumo desde frontend

### Crear pedido

```javascript
fetch("http://Proyecto_final/backend/api/api_pedidos.php", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    id_usuario: 1,
    direccion_entrega: "Calle Falsa 123",
    telefono: "099999999",
    notas: "Dejar en portería",
    metodo_pago: "efectivo",
    productos: [
      { id_producto: 12, cantidad: 2 },
      { id_producto: 5, cantidad: 1 },
    ],
  }),
})
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
```

### Actualizar estado de un pedido

```javascript
fetch("http://Proyecto_final/backend/api/api_pedidos.php", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: 15, estado: "entregado" }),
})
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
```

---

## 📝 Notas importantes

- Todos los datos se envían y reciben en **JSON**.
- El total del pedido se calcula automáticamente según los precios actuales de los productos.
- Se pueden incluir pedidos sin usuario (`id_usuario = null`) para clientes invitados.
- El número de pedido se genera automáticamente y es único.
- El backend gestiona la transacción completa de pedido y sus detalles, haciendo rollback si ocurre un error.

---

## 🔍 Ejemplos de respuesta JSON

**Éxito al crear pedido:**

```json
{
  "mensaje": "Pedido creado exitosamente",
  "id_pedido": 25,
  "numero_pedido": "PED-202511150123"
}
```

**Error por datos faltantes:**

```json
{
  "error": "Faltan datos requeridos: direccion_entrega"
}
```

**Éxito al actualizar estado:**

```json
{
  "mensaje": "Estado actualizado",
  "id": 25,
  "estado": "entregado"
}
```

**Error por estado inválido:**

```json
{
  "error": "No se pudo actualizar el estado"
}
```
