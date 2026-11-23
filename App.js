import React, { useMemo, useState } from "react";
import {View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert, StatusBar} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

const C = {
  bg: "#100D19",
  card: "#211B30",
  lime: "#B8FF32",
  purple: "#8B50F6",
  white: "#FFFFFF",
  muted: "#C9C2D5"
};

const categories = [
  "Todas",
  "Lectura y Creatividad",
  "Organización y Orden",
  "Tecnología",
  "Home Office"
];

const initialProducts = [
  {
    id: "PROD-001",
    name: "Libro de creatividad",
    category: categories[1],
    price: 35000,
    stock: 10,
    description: "Libro con ideas y ejercicios para estimular la creatividad y desarrollar proyectos personales.",
    icon: "📚"
  },
  {
    id: "PROD-002",
    name: "Libreta de diseño",
    category: categories[1],
    price: 22000,
    stock: 14,
    description: "Libreta de diseño con hojas de calidad para bocetos, apuntes y proyectos creativos.",
    icon: "📓"
  },
  {
    id: "PROD-003",
    name: "Kit de lettering",
    category: categories[1],
    price: 28000,
    stock: 8,
    description: "Kit de herramientas para practicar lettering, ilustración y escritura creativa.",
    icon: "🖊️"
  },
  {
    id: "PROD-004",
    name: "Caja organizadora",
    category: categories[2],
    price: 32000,
    stock: 12,
    description: "Caja minimalista para guardar accesorios y mantener los espacios ordenados.",
    icon: "📦"
  },
  {
    id: "PROD-005",
    name: "Contenedor multiusos",
    category: categories[2],
    price: 25000,
    stock: 16,
    description: "Contenedor práctico para clasificar objetos y aprovechar mejor cada espacio.",
    icon: "🧺"
  },
  {
    id: "PROD-006",
    name: "Separadores de cajón",
    category: categories[2],
    price: 18000,
    stock: 0,
    description: "Separadores ajustables para organizar cajones y mantener cada objeto en su lugar.",
    icon: "🗂️"
  },
  {
    id: "PROD-007",
    name: "Audífonos inalámbricos",
    category: categories[3],
    price: 75000,
    stock: 12,
    description: "Sonido envolvente, batería de larga duración y diseño plegable para tu rutina.",
    icon: "🎧"
  },
  {
    id: "PROD-008",
    name: "Reloj inteligente",
    category: categories[3],
    price: 120000,
    stock: 8,
    description: "Reloj inteligente con funciones prácticas para acompañar tus actividades diarias.",
    icon: "⌚"
  },
  {
    id: "PROD-009",
    name: "Cargador portátil",
    category: categories[3],
    price: 55000,
    stock: 15,
    description: "Batería externa compacta para mantener tus dispositivos con energía durante el día.",
    icon: "🔋"
  },
  {
    id: "PROD-010",
    name: "Soporte para portátil",
    category: categories[4],
    price: 45000,
    stock: 9,
    description: "Soporte ergonómico que ayuda a elevar el portátil y organizar tu espacio de trabajo.",
    icon: "💻"
  },
  {
    id: "PROD-011",
    name: "Lámpara de escritorio LED",
    category: categories[4],
    price: 48000,
    stock: 10,
    description: "Lámpara LED de escritorio para iluminar tus sesiones de estudio y trabajo.",
    icon: "💡"
  },
  {
    id: "PROD-012",
    name: "Organizador de escritorio",
    category: categories[4],
    price: 30000,
    stock: 11,
    description: "Organizador minimalista para mantener tus útiles y accesorios siempre a mano.",
    icon: "🗃️"
  }
];

const money = n =>
  "$" + Math.round(n).toLocaleString("es-CO");

const shippingFor = n => n === 0 || n >= 150000 ? 0 : 8000;

function Button({
  title,
  onPress,
  disabled = false,
  outline = false
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        s.button,
        outline && s.outline,
        disabled && { opacity: 0.4 }
      ]}
    >
      <Text
        style={[
          s.buttonText,
          outline && { color: C.white }
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export default function App() {

  const [products, setProducts] = useState(initialProducts);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  const [page, setPage] = useState("Inicio");
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [sort, setSort] = useState("none");

  const [buyer, setBuyer] = useState({
    nombre: "",
    telefono: "",
    municipio: "",
    direccion: ""
  });

  const [checkout, setCheckout] = useState(false);

  const subtotal = cart.reduce(
    (sum, p) => sum + p.price * p.qty,
    0
  );

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  const count = cart.reduce(
    (sum, p) => sum + p.qty,
    0
  );

  const visible = useMemo(() => {

    let data = [...products];
    if (page === "Favoritos") {
      data = data.filter(p =>
        favorites.includes(p.id)
      );
    }

    if (category !== "Todas") {
      data = data.filter(p =>
        p.category === category
      );
    }

    if (search.trim()) {
      data = data.filter(p =>
        p.name.toLowerCase().includes(
          search.trim().toLowerCase()
        )
      );
    }

    if (sort === "asc") {
      data.sort((a, b) => a.price - b.price);
    }

    if (sort === "desc") {
      data.sort((a, b) => b.price - a.price);
    }
    return data;

  }, [products, favorites, page, category, search, sort]);

  function add(product) {

    const line = cart.find(p => p.id === product.id);
    const qty = line ? line.qty : 0;

    if (product.stock === 0 || qty + 1 > product.stock) {
      return Alert.alert("Sin existencias suficientes");
    }

    setCart(old =>
      line
        ? old.map(p =>
            p.id === product.id
              ? { ...p, qty: p.qty + 1 }
              : p
          )
        : [...old, { ...product, qty: 1 }]
    );

    Alert.alert(
      "MUNOVA",
      "Producto agregado al carrito."
    );
  }

  function quantity(id, delta) {

    const line = cart.find(p => p.id === id);
    const next = line.qty + delta;

    if (next <= 0) {
      return setCart(old =>
        old.filter(p => p.id !== id)
      );
    }

    const product = products.find(p => p.id === id);

    if (next > product.stock) {
      return Alert.alert("Stock insuficiente");
    }

    setCart(old =>
      old.map(p =>
        p.id === id
          ? { ...p, qty: next }
          : p
      )
    );
  }

  function confirm() {

    if (Object.values(buyer).some(v => !v.trim())) {
      return Alert.alert("Completa los cuatro campos.");
    }

    if (!cart.length) {
      return Alert.alert("El carrito está vacío.");
    }

    const invalid = cart.find(
      line =>
        (products.find(p => p.id === line.id)?.stock || 0)
        < line.qty
    );

    if (invalid) {
      return Alert.alert(
        "No hay stock suficiente. No se confirmó el pedido."
      );
    }

    const order = {
      code: "MNV-" + Date.now().toString().slice(-7),
      date: new Date().toLocaleString("es-CO"),
      items: cart.map(p => ({ ...p })),
      subtotal,
      shipping,
      total
    };

    setProducts(old =>
      old.map(p => {
        const line = cart.find(x => x.id === p.id);
        return line
          ? { ...p, stock: p.stock - line.qty }
          : p;
      })
    );

    setOrders(old => [order, ...old]);

    setCart([]);
    setCheckout(false);

    setBuyer({
      nombre: "",
      telefono: "",
      municipio: "",
      direccion: ""
    });

    setPage("Historial");
    Alert.alert(
      "Pedido simulado",
      `Pedido ${order.code} confirmado. No se realizó ningún cobro.`
    );
  }

  const title =
    page === "Carrito"
      ? "Carrito de compras"
      : page === "Historial"
      ? "Historial de pedidos"
      : page === "Detalle"
      ? "MUNOVA"
      : page === "Favoritos"
      ? "Mis favoritos"
      : "MUNOVA";
  return (

    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={s.body}
        keyboardShouldPersistTaps="handled"
      >

        {page === "Detalle" && selected ? (
          <>
            <View style={s.top}>

              <Text
                onPress={() => setPage("Inicio")}
                style={s.topIcon}
              >
                ‹
              </Text>

              <Text style={s.heading}>
                MUNOVA
              </Text>

              <Text
                onPress={() =>
                  setFavorites(old =>
                    old.includes(selected.id)
                      ? old.filter(x => x !== selected.id)
                      : [...old, selected.id]
                  )
                }
                style={s.topIcon}
              >
                {favorites.includes(selected.id) ? "♥" : "♡"}
              </Text>
            </View>

            <View style={s.hero}>
              <Text style={{ fontSize: 100 }}>
                {selected.icon}
              </Text>
            </View>

            <Text style={s.detailTitle}>
              {selected.name}
            </Text>

            <Text style={s.description}>
              {selected.description}
            </Text>

            <Text style={s.detailPrice}>
              {money(selected.price)}
            </Text>

            <Text style={s.stock}>
              {selected.stock > 0
                ? `✓ En stock (${selected.stock})`
                : "Agotado"}
            </Text>

            <View style={s.info}>
              <Text style={s.white}>
                🚚 Envío desde $8.000
              </Text>

              <Text style={s.muted}>
                Gratis en compras desde $150.000
              </Text>
            </View>

            <Button
              title="Agregar al carrito"
              onPress={() => add(selected)}
              disabled={selected.stock === 0}
            />
          </>
        ) : null}

        {["Inicio", "Favoritos"].includes(page) && (
          <>
            <Text style={s.brand}>
              ✳ MUNOVA
            </Text>

            <Text style={s.tagline}>
              Descubre. Compra. Disfruta.
            </Text>

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="⌕  Buscar productos..."
              placeholderTextColor={C.muted}
              style={s.search}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 14 }}
            >

              {categories.map((cat, i) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    s.category,
                    {
                      backgroundColor:
                        i % 2 ? C.lime : C.purple,
                      borderWidth: category === cat ? 2 : 0,
                      borderColor: C.white
                    }
                  ]}
                >

                  <Text
                    style={{
                      color: i % 2 ? C.bg : C.white,
                      fontWeight: "800",
                      textAlign: "center",
                      fontSize: 11
                    }}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={s.row}>
              <Text style={s.section}>
                {page === "Favoritos"
                  ? "Mis favoritos"
                  : "Productos destacados"}
              </Text>

              <Text style={s.lime}>
                {visible.length} productos
              </Text>

            </View>

            <View style={s.row}>

              <Text
                onPress={() => setSort("asc")}
                style={s.muted}
              >
                Menor precio
              </Text>

              <Text
                onPress={() => setSort("desc")}
                style={s.muted}
              >
                Mayor precio
              </Text>

              <Text
                onPress={() => setSort("none")}
                style={s.muted}
              >
                Limpiar
              </Text>
            </View>

            {visible.length === 0 ? (
              <Text style={s.empty}>
                No encontramos productos.
              </Text>
            ) : (
              <View style={s.grid}>
                {visible.map(p => (
                  <View
                    key={p.id}
                    style={s.product}
                  >

                    <Pressable
                      onPress={() => {
                        setSelected(p);
                        setPage("Detalle");
                      }}
                      style={s.productPic}
                    >
                      <Text style={{ fontSize: 48 }}>
                        {p.icon}
                      </Text>
                    </Pressable>

                    <Text
                      onPress={() =>
                        setFavorites(old =>
                          old.includes(p.id)
                            ? old.filter(x => x !== p.id)
                            : [...old, p.id]
                        )
                      }
                      style={s.heart}
                    >
                      {favorites.includes(p.id) ? "♥" : "♡"}
                    </Text>

                    <Text
                      style={s.productName}
                      onPress={() => {
                        setSelected(p);
                        setPage("Detalle");
                      }}
                    >
                      {p.name}
                    </Text>

                    <Text style={s.productPrice}>
                      {money(p.price)}
                    </Text>

                    <Text style={s.stockSmall}>
                      {p.stock > 0
                        ? `Stock: ${p.stock}`
                        : "Agotado"}
                    </Text>

                    <Button
                      title="Agregar +"
                      onPress={() => add(p)}
                      disabled={!p.stock}
                    />
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {page === "Carrito" && (
          <>
            <Text style={s.heading}>
              {title}
            </Text>

            {!cart.length ? (
              <Text style={s.empty}>
                Tu carrito está vacío. Explora MUNOVA y agrega productos.
              </Text>
            ) : (
              <>
                {cart.map(p => (
                  <View
                    key={p.id}
                    style={s.cartLine}
                  >

                    <Text style={{ fontSize: 32 }}>
                      {p.icon}
                    </Text>

                    <View style={{ flex: 1 }}>
                      <Text style={s.white}>
                        {p.name}
                      </Text>

                      <Text style={s.lime}>
                        {money(p.price)}
                      </Text>

                      <View style={s.row}>
                        <Text
                          onPress={() => quantity(p.id, -1)}
                          style={s.qty}
                        >
                          −
                        </Text>

                        <Text style={s.white}>
                          {p.qty}
                        </Text>

                        <Text
                          onPress={() => quantity(p.id, 1)}
                          style={s.qty}
                        >
                          +
                        </Text>

                        <Text
                          onPress={() =>
                            setCart(old =>
                              old.filter(x => x.id !== p.id)
                            )
                          }
                          style={s.remove}
                        >
                          Quitar
                        </Text>
                      </View>
                    </View>

                    <Text style={s.lime}>
                      {money(p.price * p.qty)}
                    </Text>
                  </View>
                ))}

                <View style={s.summary}>
                  <View style={s.row}>
                    <Text style={s.white}>Subtotal</Text>
                    <Text style={s.white}>{money(subtotal)}</Text>
                  </View>

                  <View style={s.row}>
                    <Text style={s.white}>Envío</Text>
                    <Text style={s.white}>
                      {shipping ? money(shipping) : "Gratis"}
                    </Text>
                  </View>

                  <View style={s.row}>
                    <Text style={s.section}>Total</Text>
                    <Text style={s.total}>{money(total)}</Text>
                  </View>
                </View>

                <Button
                  title="Confirmar compra"
                  onPress={() => setCheckout(true)}
                />
              </>
            )}
          </>
        )}

        {page === "Historial" && (
          <>

            <Text style={s.heading}>
              {title}
            </Text>

            {orders.length === 0 ? (

              <Text style={s.empty}>
                Aún no tienes pedidos confirmados.
              </Text>
            ) : (
              orders.map(o => (
                <View
                  key={o.code}
                  style={s.order}
                >

                  <Text style={s.lime}>
                    {o.code}
                  </Text>

                  <Text style={s.muted}>
                    {o.date}
                  </Text>

                  {o.items.map(p => (

                    <Text
                      key={p.id}
                      style={s.white}
                    >
                      {p.qty} × {p.name} · {money(p.price)}
                    </Text>
                  ))}

                  <Text style={s.total}>
                    {money(o.total)}
                  </Text>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {page !== "Detalle" && (
        <View style={s.tabs}>
          {["Inicio", "Favoritos", "Carrito", "Historial"].map(name => (
            <Pressable
              key={name}
              onPress={() => {
                setPage(name);
                setSearch("");
                setCategory("Todas");
              }}
            >

              <Text
                style={[
                  s.tabText,
                  page === name && { color: C.lime }
                ]}
              >

                {name === "Inicio"
                  ? "⌂"
                  : name === "Favoritos"
                  ? "♡"
                  : name === "Carrito"
                  ? "🛒"
                  : "◷"}
                {"\n"}
                {name}
                {name === "Carrito" && count
                  ? ` (${count})`
                  : ""}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {checkout && (
        <View style={s.overlay}>
          <View style={s.modal}>

            <Text style={s.section}>
              Datos del comprador
            </Text>

            <Text style={s.muted}>
              Datos ficticios para registrar el pedido.
            </Text>

            {[
              ["nombre", "Nombre"],
              ["telefono", "Teléfono"],
              ["municipio", "Municipio"],
              ["direccion", "Dirección"]
            ].map(([k, label]) => (

              <TextInput
                key={k}
                value={buyer[k]}
                onChangeText={v =>
                  setBuyer(old => ({
                    ...old,
                    [k]: v
                  }))
                }
                placeholder={label}
                placeholderTextColor={C.muted}
                style={s.input}
              />
            ))}

            <Text style={s.white}>
              Total: {money(total)}
            </Text>

            <Button
              title="Confirmar pedido simulado"
              onPress={confirm}
            />

            <Button
              title="Cancelar"
              outline
              onPress={() => setCheckout(false)}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: C.bg
  },

  body: {
    padding: 17,
    paddingBottom: 28
  },

  brand: {
    fontSize: 32,
    fontWeight: "900",
    color: C.white,
    marginTop: 10
  },

  tagline: {
    color: C.white,
    marginLeft: 40,
    marginBottom: 18
  },

  search: {
    backgroundColor: "#514A60",
    borderRadius: 25,
    padding: 14,
    color: C.white,
    marginBottom: 15
  },

  category: {
    width: 100,
    minHeight: 72,
    borderRadius: 16,
    marginRight: 9,
    justifyContent: "center",
    alignItems: "center",
    padding: 9
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8
  },

  section: {
    fontSize: 18,
    fontWeight: "900",
    color: C.white
  },

  lime: {
    color: C.lime,
    fontWeight: "900"
  },

  muted: {
    color: C.muted,
    fontSize: 12
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },

  product: {
    width: "48%",
    backgroundColor: "#F7F3FC",
    borderRadius: 16,
    padding: 9,
    marginBottom: 12
  },

  productPic: {
    height: 105,
    backgroundColor: "#E8DDFB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  heart: {
    position: "absolute",
    right: 17,
    top: 115,
    fontSize: 22,
    color: C.purple
  },

  productName: {
    fontWeight: "800",
    color: C.bg,
    marginTop: 8
  },

  productPrice: {
    fontWeight: "900",
    color: "#83B900",
    fontSize: 16
  },

  stockSmall: {
    fontSize: 10,
    color: "#554D60"
  },

  button: {
    backgroundColor: C.lime,
    padding: 13,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 9
  },

  buttonText: {
    color: C.bg,
    fontWeight: "900"
  },

  outline: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.muted
  },

  heading: {
    fontSize: 23,
    fontWeight: "900",
    color: C.white,
    marginVertical: 15
  },

  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  topIcon: {
    fontSize: 32,
    color: C.white
  },

  hero: {
    height: 230,
    backgroundColor: "#E8DDFB",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 18
  },

  detailTitle: {
    fontSize: 25,
    fontWeight: "900",
    color: C.white
  },

  description: {
    color: C.muted,
    lineHeight: 22,
    marginTop: 8
  },

  detailPrice: {
    fontSize: 30,
    fontWeight: "900",
    color: C.lime,
    marginTop: 15
  },

  stock: {
    alignSelf: "flex-start",
    backgroundColor: C.lime,
    color: C.bg,
    padding: 8,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 8,
    fontWeight: "900"
  },

  info: {
    backgroundColor: C.card,
    padding: 15,
    borderRadius: 15,
    marginTop: 18
  },

  white: {
    color: C.white,
    fontWeight: "700"
  },

  empty: {
    color: C.muted,
    backgroundColor: C.card,
    padding: 22,
    borderRadius: 16,
    marginTop: 18
  },

  cartLine: {
    backgroundColor: C.card,
    padding: 12,
    borderRadius: 15,
    marginVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },

  qty: {
    backgroundColor: "#403653",
    color: C.white,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 15,
    fontSize: 18
  },

  remove: {
    color: "#FF9BAE",
    fontSize: 11
  },

  summary: {
    backgroundColor: C.card,
    padding: 16,
    borderRadius: 15,
    marginTop: 12,
    gap: 12
  },

  total: {
    fontSize: 22,
    color: C.lime,
    fontWeight: "900"
  },

  tabs: {
    backgroundColor: "#17121F",
    borderTopWidth: 1,
    borderColor: "#453B59",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10
  },

  tabText: {
    color: C.white,
    textAlign: "center",
    fontSize: 11
  },

  order: {
    backgroundColor: C.card,
    padding: 15,
    borderRadius: 15,
    marginVertical: 8,
    gap: 5
  },

  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,.8)",
    justifyContent: "center",
    padding: 18
  },

  modal: {
    backgroundColor: C.bg,
    padding: 18,
    borderRadius: 20,
    gap: 9,
    borderWidth: 1,
    borderColor: C.purple
  },

  input: {
    backgroundColor: C.card,
    color: C.white,
    padding: 12,
    borderRadius: 10
  }

});