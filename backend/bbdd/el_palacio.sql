-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 04-12-2025 a las 01:01:03
-- Versión del servidor: 12.1.2-MariaDB
-- Versión de PHP: 8.4.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `el_palacio`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detallepedido`
--

CREATE TABLE `detallepedido` (
  `id_detalle` int(11) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `subtotal` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detallepedido`
--

INSERT INTO `detallepedido` (`id_detalle`, `id_pedido`, `id_producto`, `cantidad`, `subtotal`) VALUES
(17, 16, 18, 1, 11);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `id_pedido` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `direccion_entrega` varchar(255) NOT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'recibido',
  `telefono` varchar(20) DEFAULT NULL,
  `metodo_pago` varchar(50) NOT NULL,
  `numero_pedido` varchar(50) NOT NULL,
  `notas` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido`
--

INSERT INTO `pedido` (`id_pedido`, `fecha`, `total`, `id_usuario`, `direccion_entrega`, `estado`, `telefono`, `metodo_pago`, `numero_pedido`, `notas`) VALUES
(16, '2025-11-15 22:27:08', 11.00, 26, '123123', 'entregado', '123123', 'efectivo', 'PED-202511167789', '123123');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `nombre` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  `precio` double NOT NULL,
  `categoria` varchar(255) NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `id` int(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`nombre`, `descripcion`, `precio`, `categoria`, `imagen`, `id`) VALUES
('Pepsi 500ml', 'Gaseosa clásica 500ml', 2.5, 'Bebidas', '12.png', 12),
('Agua Mineral 500ml', 'Agua mineral sin gas 500ml', 1.8, 'Bebidas', '13.png', 13),
('Vino Malbec 750ml', 'Vino Malbec cosecha 2020 - botella 750ml', 18, 'Bebidas', '14.jpg', 14),
('Bife de Chorizo 300g', 'Bife de chorizo a la parrilla, 300g', 14.5, 'Carnes', '15.webp', 15),
('Costillas BBQ', 'Costillas de cerdo glaseadas con salsa BBQ', 16, 'Carnes', '16.jpg', 16),
('Pasta Fettuccine Alfredo', 'Fettuccine con salsa Alfredo y parmesano', 10.5, 'Pastas', '17.webp', 17),
('Ravioles de Ricota', 'Ravioles caseros rellenos de ricota y salsa a elección', 11, 'Pastas', '18.webp', 18);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id_reserva` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telefono` varchar(50) NOT NULL,
  `personas` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `comentarios` text DEFAULT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'pendiente',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reservas`
--

INSERT INTO `reservas` (`id_reserva`, `nombre`, `email`, `telefono`, `personas`, `fecha`, `hora`, `comentarios`, `estado`, `created_at`, `updated_at`) VALUES
(1, 'María López', 'maria.lopez@example.com', '+5491122233344', 2, '2025-10-20', '20:00:00', 'Mesa cerca de la ventana. Celebración pequeño aniversario.', 'confirmada', '2025-10-16 19:27:29', '2025-10-16 19:27:29'),
(2, 'Juan Pérez', 'juan.perez@example.com', '+5491166677788', 4, '2025-10-21', '21:30:00', 'Solicita menú sin gluten para 1 persona.', 'pendiente', '2025-10-16 19:27:29', '2025-10-16 19:27:29'),
(3, 'Grupo Amigos', 'grupo.amigos@example.com', '+5491177788990', 6, '2025-10-22', '19:00:00', 'Necesitan 2 mesas juntas.', 'confirmada', '2025-10-16 19:27:29', '2025-10-16 19:27:29'),
(4, 'Ana García', 'ana.garcia@example.com', '+5491144455566', 3, '2025-10-23', '13:30:00', 'Comida de trabajo, proyector disponible.', 'pendiente', '2025-10-16 19:27:29', '2025-10-16 19:27:29'),
(5, 'Familia Ruiz', 'familia.ruiz@example.com', '+5491133322110', 5, '2025-11-01', '20:30:00', 'Niños (2) con silla alta.', 'confirmada', '2025-10-16 19:27:29', '2025-10-16 19:27:29');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nombre_usuario` varchar(255) NOT NULL,
  `apellido_usuario` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `tipo` varchar(50) NOT NULL DEFAULT 'cliente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre_usuario`, `apellido_usuario`, `email`, `password`, `tipo`) VALUES
(24, 'roberto', 'mohammed', 'mohammed@correofalso.com', '$2y$10$0i6cRnBEsX6tAAu3ENvONO0m9v74KlkhJbueNC8pU2djO9KtuRxSi', 'cliente'),
(25, 'john', 'doe', 'unknown@correofalso.com', '$2y$10$utVVuCtDZIK3Ma9CrbWVZOa7s.EHiYWIfSHHAYMw5/fWCDY90J7wi', 'cliente'),
(26, 'Administrador', 'Profesional', 'administrador@administrador.com', '$2y$10$bHWNSMWQwDT./PBIJRwZ9uE6rWQYZebXbvqVSKoapx.O6lAz4pe2a', 'admin'),
(27, 'Usuario', 'Ejemplo', 'user@gmail.com', '$2y$10$YCaVhjnl5dyzkvEukl8Mluk3Kp54SNN9JByGnd25086Db1mbxwJoW', 'cliente');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `detallepedido`
--
ALTER TABLE `detallepedido`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id_pedido`),
  ADD UNIQUE KEY `numero_pedido` (`numero_pedido`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id_reserva`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `detallepedido`
--
ALTER TABLE `detallepedido`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
