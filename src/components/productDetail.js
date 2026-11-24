import React from "react";
import {
  View,
  Text,
  Pressable
} from "react-native";

import Button from "./button";
import { C } from "../styles/colors";

export default function ProductDetail({
  selected,
  favorites,
  onBack,
  onToggleFavorite,
  money,
  selectedReviews,
  reviewAverage,
  rating,
  onRatingChange,
  onSaveReview,
  onAddToCart,
  s
}) {
  return (
    <>
      <View style={s.top}>
        <Text
          onPress={onBack}
          style={s.topIcon}
        >
          ‹
        </Text>

        <Text style={s.heading}>
          MUNOVA
        </Text>

        <Text
          onPress={onToggleFavorite}
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
              onPress={() => onRatingChange(number)}
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
          onPress={onSaveReview}
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
        onPress={onAddToCart}
        disabled={selected.stock === 0}
      />
    </>
  );
}