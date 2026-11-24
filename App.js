import React, { useEffect, useMemo, useState } from "react";
import {View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert, StatusBar} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { categories } from "./src/data/categories";
import { initialProducts } from "./src/data/initialProducts";

const C = {
  bg: "#100D19",
  card: "#211B30",
  lime: "#C6FF3D",
  purple: "#8B5CF6",
  white: "#FFFFFF",
  muted: "#C9C2D5"
};

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
  const [reviews, setReviews] = useState({});
  const [rating, setRating] = useState(0);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  const [storageReady, setStorageReady] = useState(false);

  const [page, setPage] = useState("Inicio");
  const [selected, setSelected] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [editingProductId, setEditingProductId] = useState(null);

  const [sellerForm, setSellerForm] = useState({
    name: "",
    category: categories[1],
    price: "",
    stock: "",
    description: "",
    icon: "📦"
  });
  
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [sort, setSort] = useState("none");

  useEffect(() => {
  async function loadSavedData() {
    try {
      const savedData = await AsyncStorage.getItem("munova_data");

      if (savedData) {
        const parsedData = JSON.parse(savedData);

        // Recuperar favoritos válidos
        const savedFavorites = Array.isArray(parsedData.favorites)
          ? parsedData.favorites.filter(id =>
              typeof id === "string" &&
              products.some(product => product.id === id)
            )
          : [];

        const savedCart = Array.isArray(parsedData.cart)
          ? parsedData.cart.reduce((result, item) => {
              const product = products.find(p => p.id === item.id);

              if (
                !product ||
                !Number.isInteger(item.qty) ||
                item.qty <= 0 ||
                !Number.isInteger(product.stock) ||
                product.stock < 0
              ) {
                return result;
              }

              const validQuantity = Math.min(item.qty, product.stock);

              if (validQuantity > 0) {
                result.push({
                  ...product,
                  qty: validQuantity
                });
              }

              return result;
            }, [])
          : [];

        setFavorites([...new Set(savedFavorites)]);
        setCart(savedCart);
      }
    } catch (error) {
      console.log("Error al recuperar los datos locales:", error);

      setFavorites([]);
      setCart([]);
    } finally {
      setStorageReady(true);
    }
  }

  loadSavedData();
}, []);

useEffect(() => {
  async function saveData() {
    try {
      const data = {
        cart: cart.map(p => ({
          id: p.id,
          qty: p.qty
        })),
        favorites
      };

      await AsyncStorage.setItem(
        "munova_data",
        JSON.stringify(data)
      );
    } catch (error) {
      console.log("Error al guardar los datos locales:", error);
    }
  }

  if (storageReady) {
    saveData();
  }
}, [cart, favorites, storageReady]);

  const [showSort, setShowSort] = useState(false);

  const [buyer, setBuyer] = useState({
    nombre: "",
    telefono: "",
    municipio: "",
    direccion: ""
  });

  const [checkout, setCheckout] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const subtotal = cart.reduce(
    (sum, p) => sum + p.price * p.qty,
    0
  );

  const shipping = shippingFor(subtotal);
  const discount = appliedCoupon === "MUNOVA10"
    ? Math.round(subtotal * 0.10)
    : 0;

  const total = subtotal + shipping - discount;

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

  function applyCoupon() {

  const code = couponInput.trim().toUpperCase();

  if (!code) {
    return Alert.alert(
      "Cupón vacío",
      "Ingresa un código promocional."
    );
  }

  if (code !== "MUNOVA10") {
    return Alert.alert(
      "Cupón inválido",
      "El código ingresado no existe o no es válido."
    );
  }

  if (appliedCoupon) {
    return Alert.alert(
      "Cupón aplicado",
      "Ya tienes un cupón promocional activo."
    );
  }

  setAppliedCoupon(code);
  setCouponInput("");

  Alert.alert(
    "¡Cupón aplicado!",
    "Has obtenido un descuento del 10%."
  );
}

function resetSellerForm() {
  setSellerForm({
    name: "",
    category: categories[1],
    price: "",
    stock: "",
    description: "",
    icon: "📦"
  });

  setEditingProductId(null);
}

function editProduct(product) {
  setEditingProductId(product.id);

  setSellerForm({
    name: product.name,
    category: product.category,
    price: String(product.price),
    stock: String(product.stock),
    description: product.description,
    icon: product.icon || "📦"
  });
}

function saveSellerProduct() {
  const name = sellerForm.name.trim();
  const price = Number(sellerForm.price);
  const stock = Number(sellerForm.stock);

  if (!name || !sellerForm.price.trim() || !sellerForm.stock.trim()) {
    return Alert.alert(
      "Campos obligatorios",
      "Completa el nombre, precio y stock del producto."
    );
  }

  if (!Number.isFinite(price) || price <= 0) {
    return Alert.alert(
      "Precio inválido",
      "El precio debe ser un número mayor que cero."
    );
  }

  if (
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    return Alert.alert(
      "Stock inválido",
      "El stock debe ser un número entero igual o mayor que cero."
    );
  }

  if (!sellerForm.category || sellerForm.category === "Todas") {
    return Alert.alert(
      "Categoría inválida",
      "Selecciona una categoría para el producto."
    );
  }

  const productData = {
    name,
    category: sellerForm.category,
    price,
    stock,
    description: sellerForm.description.trim(),
    icon: sellerForm.icon.trim() || "📦"
  };

  if (editingProductId) {
    setProducts(old =>
      old.map(product =>
        product.id === editingProductId
          ? { ...product, ...productData }
          : product
      )
    );

    Alert.alert(
      "Producto actualizado",
      "Los cambios se guardaron correctamente."
    );
  } else {
    let id = `PROD-${Date.now()}`;

    while (products.some(product => product.id === id)) {
      id = `PROD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }

    setProducts(old => [
      ...old,
      {
        id,
        ...productData
      }
    ]);

    Alert.alert(
      "Producto registrado",
      "El producto se agregó correctamente al catálogo."
    );
  }

  resetSellerForm();
}

function saveReview() {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Alert.alert(
      "Valoración inválida",
      "Selecciona una calificación entre 1 y 5 estrellas."
    );
  }

  setReviews(old => ({
    ...old,
    [selected.id]: [
      ...(old[selected.id] || []),
      {
        id: Date.now().toString(),
        rating
      }
    ]
  }));

  setRating(0);

  Alert.alert(
    "¡Gracias por tu valoración!",
    "Tu reseña se registró correctamente."
  );
}
  
  function confirm() {

    const campos = {
      nombre: "Nombre",
      telefono: "Teléfono",
      municipio: "Municipio",
      direccion: "Dirección"
    };

    const camposVacios = Object.entries(campos)
      .filter(([key]) => !buyer[key].trim())
      .map(([, label]) => label);

    if (camposVacios.length > 0) {
      return Alert.alert(
        "Campos obligatorios",
        `Completa los siguientes campos:\n\n${camposVacios.join("\n")}`
      );
    }

    if (!/^\d+$/.test(buyer.telefono.trim())) {
      return Alert.alert(
        "Teléfono inválido",
        "El teléfono debe contener únicamente números."
      );
    }

    if (buyer.telefono.trim().length !== 10) {
      return Alert.alert(
        "Teléfono inválido",
        "El teléfono debe tener exactamente 10 dígitos."
      );
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
      discount,
      coupon: appliedCoupon,
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

    setAppliedCoupon("");
    setCouponInput("");

    setPage("Historial");

    Alert.alert(
      "Pedido simulado",
      `Pedido ${order.code} confirmado. No se realizó ningún cobro.`
    );
  }

  const selectedReviews = selected
  ? reviews[selected.id] || []
  : [];

  const reviewAverage = selectedReviews.length
    ? selectedReviews.reduce(
        (sum, review) => sum + review.rating,
        0
      ) / selectedReviews.length
    : 0;

  const title =
    page === "Carrito"
      ? "Carrito de compras"
      : page === "Historial"
      ? "Historial de pedidos"
      : page === "Detalle"
      ? "MUNOVA"
      : page === "Vendedor"
      ? "Panel de vendedor"
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

            <Text style={s.detailCategory}>
              {selected.category}
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

            <View style={{
              backgroundColor: C.card,
              padding: 16,
              borderRadius: 16,
              marginTop: 20,
              gap: 12
            }}>
              <Text style={s.section}>
                Opiniones de compradores
              </Text>

              <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8
              }}>
                <Text style={{
                  color: C.lime,
                  fontSize: 25,
                  fontWeight: "900"
                }}>
                  {selectedReviews.length > 0
                    ? reviewAverage.toFixed(1)
                    : "—"}
                </Text>

                <View>
                  <Text style={{ color: C.lime, fontSize: 18 }}>
                    {selectedReviews.length > 0
                      ? "★".repeat(Math.round(reviewAverage))
                      : "☆☆☆☆☆"}
                  </Text>

                  <Text style={s.muted}>
                    {selectedReviews.length} valoraciones
                  </Text>
                </View>
              </View>

              <View style={s.divider} />

              <Text style={s.white}>
                Califica este producto
              </Text>

              <View style={{
                flexDirection: "row",
                gap: 10
              }}>
                {[1, 2, 3, 4, 5].map(number => (
                  <Pressable
                    key={number}
                    onPress={() => setRating(number)}
                  >
                    <Text style={{
                      fontSize: 32,
                      color: number <= rating ? C.lime : "#6D637D"
                    }}>
                      ★
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={s.muted}>
                {rating > 0
                  ? `Seleccionaste ${rating} de 5 estrellas`
                  : "Selecciona una cantidad de estrellas"}
              </Text>

              <Button
                title="Enviar valoración"
                onPress={saveReview}
              />

              <View style={s.divider} />

              <Text style={s.white}>
                Valoraciones registradas
              </Text>

              {selectedReviews.length === 0 ? (
                <Text style={s.muted}>
                  Este producto todavía no tiene valoraciones.
                </Text>
              ) : (
                selectedReviews.map(review => (
                  <View
                    key={review.id}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 5
                    }}
                  >
                    <Text style={s.muted}>
                      Comprador simulado
                    </Text>

                    <Text style={{
                      color: C.lime,
                      fontSize: 17
                    }}>
                      {"★".repeat(review.rating)}
                      <Text style={{ color: "#6D637D" }}>
                        {"☆".repeat(5 - review.rating)}
                      </Text>
                    </Text>
                  </View>
                ))
              )}
            </View>

            <View style={s.info}>
              <Text style={s.white}>
                🚚 Envíos a $8.000
              </Text>

              <Text style={s.muted}>
                En compras menores a $150.000
              </Text>
            </View>

            <Button
              title="🛒 Agregar al carrito"
              onPress={() => add(selected)}
              disabled={selected.stock === 0}
            />
          </>
        ) : null}

        {["Inicio", "Favoritos"].includes(page) && (
          <>
            <View style={s.appHeader}>
              <View>
                <Pressable onPress={() => setPage("Vendedor")}>
                  <Text style={s.brand}>✳ MUNOVA</Text>
                </Pressable>

                <Text style={s.tagline}>
                  Descubre. Compra. Disfruta.
                </Text>
              </View>

              <View style={s.notificationButton}>
                  <Ionicons
                  name="notifications-outline"
                  size={23}
                  color={C.lime}
                />
              </View>
            </View>

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

           <View style={s.productsHeader}>

            <Text style={s.section}>
              {page === "Favoritos"
                ? "Mis favoritos"
                : "Productos destacados"}
            </Text>

            <View style={s.sortContainer}>

              <Pressable
                onPress={() => setShowSort(!showSort)}
                style={s.sortButton}
              >
                <Text style={s.sortButtonText}>
                  {sort === "asc"
                    ? "Menor precio"
                    : sort === "desc"
                    ? "Mayor precio"
                    : "Ordenar por"}
                </Text>

                  {<Ionicons name={showSort ? "chevron-up" : "chevron-down"} size={16} color={C.lime}/>}
              </Pressable>

              {showSort && (
                <View style={s.sortMenu}>

                  <Pressable
                    onPress={() => {
                      setSort("asc");
                      setShowSort(false);
                    }}
                    style={s.sortOption}
                  >
                    <Text style={s.sortOptionText}>
                      ↑ Menor precio
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setSort("desc");
                      setShowSort(false);
                    }}
                    style={s.sortOption}
                  >
                    <Text style={s.sortOptionText}>
                      ↓ Mayor precio
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setSort("none");
                      setShowSort(false);
                    }}
                    style={s.sortOption}
                  >
                    <Text style={s.sortClearText}>
                      Limpiar orden
                    </Text>
                  </Pressable>

                </View>
              )}
            </View>
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

                    <Pressable
                      onPress={() =>
                        setFavorites(old =>
                          old.includes(p.id)
                            ? old.filter(x => x !== p.id)
                            : [...old, p.id]
                        )
                      }
                      style={s.heart}
                    >
                      <Text style={s.heartText}>
                        {favorites.includes(p.id) ? "♥" : "♡"}
                      </Text>
                    </Pressable>

                    <Text
                      style={s.productName}
                      onPress={() => {
                        setSelected(p);
                        setRating(0);
                        setPage("Detalle");
                      }}
                    >
                      {p.name}
                    </Text>

                    <Text style={s.productCategory}>
                      {p.category}
                    </Text>

                    <Text
                      style={[
                        s.availability,
                        {
                          color: p.stock > 0 ? "#83B900" : "#FF6B9D"
                        }
                      ]}
                    >
                      {p.stock > 0 ? "● Disponible" : "● Agotado"}
                    </Text>

                    <View style={s.productBottom}>

                      
                      <Text style={s.productPrice}>
                        {money(p.price)}
                      </Text>
              
                      <Pressable
                        onPress={() => add(p)}
                        disabled={!p.stock}
                        style={[
                          s.cartButton,
                          !p.stock && { opacity: 0.4 }
                        ]}
                      >
                        
                        <Text style={s.cartButtonText}>
                          <Ionicons
                            name="cart-outline"
                            size={20}
                            color={C.bg}
                          />
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {page === "Vendedor" && (
        <>
          <View style={s.top}>
            <Text style={s.heading}>
              Panel de vendedor
            </Text>

            <Pressable
              onPress={() => {
                resetSellerForm();
                setPage("Inicio");
              }}
            >
              <Ionicons
                name="close"
                size={26}
                color={C.white}
              />
            </Pressable>
          </View>

          <Text style={s.muted}>
            Administra tu tienda y actualiza tu catálogo.
          </Text>

          {/* Resumen */}
          <View style={{
            flexDirection: "row",
            gap: 10,
            marginTop: 20
          }}>
            <View style={{
              flex: 1,
              backgroundColor: C.card,
              padding: 15,
              borderRadius: 15
            }}>
              <Ionicons name="cube-outline" size={22} color={C.lime} />
              <Text style={s.muted}>Productos</Text>
              <Text style={s.total}>{products.length}</Text>
            </View>

            <View style={{
              flex: 1,
              backgroundColor: C.card,
              padding: 15,
              borderRadius: 15
            }}>
              <Ionicons name="receipt-outline" size={22} color={C.purple} />
              <Text style={s.muted}>Pedidos</Text>
              <Text style={s.total}>{orders.length}</Text>
            </View>
          </View>

          {/* Formulario de productos */}
          <View style={{
            backgroundColor: C.card,
            padding: 16,
            borderRadius: 18,
            marginTop: 22,
            gap: 10
          }}>
            <Text style={s.section}>
              {editingProductId ? "Editar producto" : "Registrar producto"}
            </Text>

            <Text style={s.muted}>
              Completa los datos para actualizar tu catálogo.
            </Text>

            <Text style={s.white}>Nombre del producto</Text>
            <TextInput
              value={sellerForm.name}
              onChangeText={v =>
                setSellerForm(old => ({ ...old, name: v }))
              }
              placeholder="Nombre del producto"
              placeholderTextColor={C.muted}
              style={s.input}
            />

            <Text style={s.white}>Categoría</Text>

            <View style={{
              gap: 8
            }}>
              {categories.slice(1).map(cat => (
                <Pressable
                  key={cat}
                  onPress={() =>
                    setSellerForm(old => ({ ...old, category: cat }))
                  }
                  style={{
                    padding: 11,
                    borderRadius: 10,
                    backgroundColor:
                      sellerForm.category === cat ? C.lime : "#403653"
                  }}
                >
                  <Text style={{
                    color: sellerForm.category === cat ? C.bg : C.white,
                    fontWeight: "700",
                    fontSize: 12
                  }}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={s.white}>Precio en COP</Text>
            <TextInput
              value={sellerForm.price}
              onChangeText={v =>
                setSellerForm(old => ({ ...old, price: v }))
              }
              placeholder="Ej. 35000"
              placeholderTextColor={C.muted}
              keyboardType="decimal-pad"
              style={s.input}
            />

            <Text style={s.white}>Stock disponible</Text>
            <TextInput
              value={sellerForm.stock}
              onChangeText={v =>
                setSellerForm(old => ({ ...old, stock: v }))
              }
              placeholder="Ej. 10"
              placeholderTextColor={C.muted}
              keyboardType="number-pad"
              style={s.input}
            />

            <Text style={s.white}>Descripción</Text>
            <TextInput
              value={sellerForm.description}
              onChangeText={v =>
                setSellerForm(old => ({ ...old, description: v }))
              }
              placeholder="Describe el producto..."
              placeholderTextColor={C.muted}
              multiline
              style={[s.input, { minHeight: 85, textAlignVertical: "top" }]}
            />

            <Text style={s.white}>Icono del producto</Text>
            <TextInput
              value={sellerForm.icon}
              onChangeText={v =>
                setSellerForm(old => ({ ...old, icon: v }))
              }
              placeholder="📦"
              placeholderTextColor={C.muted}
              style={s.input}
            />

            <Button
              title={editingProductId ? "Guardar cambios" : "Registrar producto"}
              onPress={saveSellerProduct}
            />

            {editingProductId && (
              <Button
                title="Cancelar edición"
                outline
                onPress={resetSellerForm}
              />
            )}
          </View>

          {/* Inventario */}
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 25,
            marginBottom: 10
          }}>
            <Text style={s.section}>Mis productos</Text>

            <Text style={s.lime}>
              {products.filter(p => p.stock > 0).length} disponibles
            </Text>
          </View>

          {products.map(p => (
            <View
              key={p.id}
              style={[s.order, {
                flexDirection: "row",
                alignItems: "center"
              }]}
            >
              <Text style={{ fontSize: 28 }}>
                {p.icon}
              </Text>

              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={s.white}>{p.name}</Text>
                <Text style={s.muted}>{p.id}</Text>
                <Text style={s.muted}>{p.category}</Text>

                <Text style={{
                  color: p.stock > 0 ? C.lime : "#FF6B9D",
                  fontSize: 12,
                  marginTop: 4
                }}>
                  {p.stock > 0
                    ? `${p.stock} unidades disponibles`
                    : "Agotado"}
                </Text>

                <Text style={s.lime}>
                  {money(p.price)}
                </Text>
              </View>

              <Pressable
                onPress={() => editProduct(p)}
                style={{
                  backgroundColor: "#403653",
                  padding: 10,
                  borderRadius: 10
                }}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={C.lime}
                />
              </Pressable>
            </View>
          ))}

          {/* Pedidos */}
          <Text style={[s.section, {
            marginTop: 22,
            marginBottom: 10
          }]}>
            Pedidos recibidos
          </Text>

          {orders.length === 0 ? (
            <Text style={s.empty}>
              Todavía no has recibido pedidos.
            </Text>
          ) : (
            orders.map(o => (
              <View key={o.code} style={s.order}>
                <Text style={s.lime}>{o.code}</Text>
                <Text style={s.muted}>{o.date}</Text>

                <Text style={s.white}>
                  {o.items.reduce((sum, p) => sum + p.qty, 0)} productos
                </Text>

                <Text style={s.total}>
                  {money(o.total)}
                </Text>
              </View>
            ))
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

                    <View style={s.cartInfoTop}>
                      <Text style={s.white}>
                        {p.name}
                      </Text>

                      <Text style={s.cartPrice}>
                        {money(p.price * p.qty)}
                      </Text>
                    </View>

                    <View style={s.cartActions}>

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

                      <Pressable
                        onPress={() =>
                          setCart(old =>
                            old.filter(x => x.id !== p.id)
                          )
                        }
                        style={s.removeButton}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={15}
                          color={C.muted}
                        />
                        <Text style={s.removeText}>
                          Quitar
                        </Text>
                      </Pressable>

                    </View>
                      </View>
                  </View>
                ))}

                <View style={s.couponContainer}>

                  <Text style={s.section}>
                    ¿Tienes un cupón promocional?
                  </Text>

                  {!appliedCoupon ? (
                    <>
                      <View style={s.couponRow}>

                        <TextInput
                          value={couponInput}
                          onChangeText={setCouponInput}
                          placeholder="Ingresa tu código"
                          placeholderTextColor={C.muted}
                          autoCapitalize="characters"
                          style={s.couponInput}
                        />

                        <Pressable
                          onPress={applyCoupon}
                          style={s.couponButton}
                        >
                          <Text style={s.couponButtonText}>
                            Aplicar
                          </Text>
                        </Pressable>

                      </View>
                    </>
                  ) : (
                    <View style={s.couponApplied}>

                      <View>
                        <Text style={s.lime}>
                          ✓ {appliedCoupon}
                        </Text>

                        <Text style={s.muted}>
                          Descuento del 10% aplicado
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => setAppliedCoupon("")}
                      >
                        <Text style={s.removeText}>
                          Quitar
                        </Text>
                      </Pressable>

                    </View>
                  )}

                </View>

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

                  

                  {discount > 0 && (
                    <View style={s.row}>
                      <Text style={s.lime}>
                        Descuento ({appliedCoupon})
                      </Text>

                      <Text style={s.lime}>
                        -{money(discount)}
                      </Text>
                    </View>
                  )}


                  <View style={s.row}>
                    <Text style={s.section}>Total</Text>
                    <Text style={s.total}>{money(total)}</Text>
                  </View>
                </View>

                <Button
                  title="✓ Confirmar compra"
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
                <Pressable
                  key={o.code}
                  style={s.order}
                  onPress={() => setSelectedOrder(o)}
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
                </Pressable>
              ))
            )}
          </>
        )}
              {selectedOrder && (
        <View style={s.overlay}>
          <View style={s.modal}>

            <Text style={s.section}>
              Detalle del pedido
            </Text>

            <Text style={s.lime}>
              {selectedOrder.code}
            </Text>

            <Text style={s.muted}>
              Fecha: {selectedOrder.date}
            </Text>

            <Text style={s.section}>
              Productos
            </Text>

            {selectedOrder.items.map(p => (
              <View key={p.id} style={s.row}>
                <Text style={s.white}>
                  {p.qty} × {p.name}
                </Text>

                <Text style={s.white}>
                  {money(p.price * p.qty)}
                </Text>
              </View>
            ))}

            <View style={s.divider} />

            <View style={s.row}>
              <Text style={s.white}>Subtotal</Text>
              <Text style={s.white}>
                {money(selectedOrder.subtotal)}
              </Text>
            </View>

            <View style={s.row}>
              <Text style={s.white}>Envío</Text>
              <Text style={s.white}>
                {selectedOrder.shipping
                  ? money(selectedOrder.shipping)
                  : "Gratis"}
              </Text>
            </View>

            {selectedOrder.discount > 0 && (
              <View style={s.row}>
                <Text style={s.lime}>
                  Descuento ({selectedOrder.coupon})
                </Text>

                <Text style={s.lime}>
                  -{money(selectedOrder.discount)}
                </Text>
              </View>
            )}

            <View style={s.row}>
              <Text style={s.section}>Total</Text>
              <Text style={s.total}>
                {money(selectedOrder.total)}
              </Text>
            </View>

            <Button
              title="Cerrar detalle"
              onPress={() => setSelectedOrder(null)}
            />

          </View>
        </View>
      )}
      </ScrollView>

      {page !== "Detalle" && page !== "Vendedor" && (
  <View style={s.tabs}>
    {["Inicio", "Favoritos", "Carrito", "Historial"].map(name => {

      const active = page === name;

      const iconName =
        name === "Inicio"
          ? active ? "home" : "home-outline"
          : name === "Favoritos"
          ? active ? "heart" : "heart-outline"
          : name === "Carrito"
          ? active ? "cart" : "cart-outline"
          : active ? "time" : "time-outline";

      return (
        <Pressable
          key={name}
          onPress={() => {
            setPage(name);
            setSearch("");
            setCategory("Todas");
          }}
          style={s.tabItem}
        >
          <Ionicons
            name={iconName}
            size={22}
            color={active ? C.lime : C.white}
          />

          <Text
            style={[
              s.tabText,
              {
                color: active ? C.lime : C.white,
                fontWeight: active ? "800" : "500"
              }
            ]}
          >
            {name}
            {name === "Carrito" && count > 0
              ? ` (${count})`
              : ""}
          </Text>
        </Pressable>
      );
    })}
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
                keyboardType={k === "telefono" ? "phone-pad" : "default"}
                maxLength={k === "telefono" ? 10 : undefined}
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
    marginLeft: 36,
    marginBottom: 18
  },

  appHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15
  },

  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.card,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10
  },

  notificationIcon: {
    fontSize: 23,
    color: C.lime
  },

  divider: {
    height: 1,
    backgroundColor: "#453B59",
    marginVertical: 8
  },

  search: {
    backgroundColor: "#514A60",
    borderRadius: 25,
    padding: 14,
    color: C.white,
    marginBottom: 15
  },

  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginVertical: 12
  },

  sortContainer: {
    alignItems: "flex-end",
    marginLeft: 8,
    zIndex: 10
  },

  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: "#453B59",
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 10,
    minWidth: 125
  },

  sortButtonText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "700"
  },

  lime: {
    color: C.lime,
    fontWeight: "800"
  },

  sortMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 6,
    backgroundColor: C.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#453B59",
    paddingVertical: 4,
    minWidth: 155,
    zIndex: 20,
    elevation: 8,
  },

  sortOption: {
    paddingVertical: 11,
    paddingHorizontal: 13
  },

  sortOptionText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "600"
  },

  sortClearText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: "600"
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
    fontSize: 16,
    fontWeight: "900",
    color: C.white,
    flexShrink: 1,
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
    borderRadius: 20,
    padding: 9,
    marginBottom: 15
  },

  productPic: {
    height: 105,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  heart: {
    position: "absolute",
    top: 10,
    right: 6,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2
  },

  heartText: {
    fontSize: 25,
    color: "purple",
    fontWeight: "600"
  },

  productName: {
    fontWeight: "800",
    color: C.bg,
    marginTop: 8
  },
  productCategory: {
    color: "#A69BB8",
    fontSize: 10,
    marginTop: 4,
    fontWeight: "600"
  },

  availability: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: 5
  },

  productPrice: {
    fontWeight: "900",
    color: "#83B900",
    fontSize: 16
  },

  productBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8
  },

  cartButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.lime,
    justifyContent: "center",
    alignItems: "center"
  },

  cartButtonText: {
    fontSize: 18
  },

  cartInfoTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6
  },

  cartPrice: {
    color: C.lime,
    fontSize: 16,
    fontWeight: "900"
  },

  cartActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap"
  },

  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#2B233A",
    borderWidth: 1,
    borderColor: "#453B59",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
    marginLeft: "auto"
  },

  removeText: {
    color: C.muted,
    fontSize: 11,
    fontWeight: "700"
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

  detailCategory: {
    color: C.lime,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
    marginBottom: 8,
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

  couponContainer: {
    backgroundColor: C.card,
    padding: 14,
    borderRadius: 15,
    marginTop: 12,
    marginBottom: 5,
    gap: 10
  },

  couponRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },

  couponInput: {
    flex: 1,
    backgroundColor: "#403653",
    color: C.white,
    padding: 12,
    borderRadius: 10
  },

  couponButton: {
    backgroundColor: C.lime,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10
  },

  couponButtonText: {
    color: C.bg,
    fontWeight: "900"
  },

  couponApplied: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#302A3D",
    padding: 12,
    borderRadius: 10
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

  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4
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