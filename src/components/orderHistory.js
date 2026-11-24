import React from "react";
import {
  View,
  Text,
  Pressable
} from "react-native";

export default function OrderHistory({
  title,
  orders,
  money,
  onSelectOrder,
  s
}) {
  return (
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
            onPress={() => onSelectOrder(o)}
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
  );
}