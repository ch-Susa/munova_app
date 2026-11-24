import React from "react";
import {
  View,
  Text,
  Pressable,
  TextInput
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import Button from "./button";
import { C } from "../styles/colors";

export default function CartScreen({
  title,
  cart,
  money,
  quantity,
  onRemove,
  couponInput,
  onCouponInputChange,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  subtotal,
  shipping,
  discount,
  total,
  onCheckout,
  s
}) {
  return (
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
                    onPress={() => onRemove(p.id)}
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
              <View style={s.couponRow}>
                <TextInput
                  value={couponInput}
                  onChangeText={onCouponInputChange}
                  placeholder="Ingresa tu código"
                  placeholderTextColor={C.muted}
                  autoCapitalize="characters"
                  style={s.couponInput}
                />

                <Pressable
                  onPress={onApplyCoupon}
                  style={s.couponButton}
                >
                  <Text style={s.couponButtonText}>
                    Aplicar
                  </Text>
                </Pressable>
              </View>
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

                <Pressable onPress={onRemoveCoupon}>
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
              <Text style={s.total}>
                {money(total)}
              </Text>
            </View>
          </View>

          <Button
            title="✓ Confirmar compra"
            onPress={onCheckout}
          />
        </>
      )}
    </>
  );
}