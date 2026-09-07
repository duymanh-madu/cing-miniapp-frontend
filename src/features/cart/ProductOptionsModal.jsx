import {
  useMemo,
  useState,
} from "react";

import useCartStore
  from "@/features/menu/store/cartStore";


const fmt = value => {
  const amount =
    Number(value || 0);

  return amount
    ? new Intl.NumberFormat(
        "vi-VN"
      ).format(amount) + "đ"
    : "0đ";
};


function normalizeOption(
  option
) {

  const id =
    String(
      option?.id || ""
    ).trim();

  const status =
    String(
      option?.status || ""
    )
      .trim()
      .toUpperCase();

  const price =
    Number(
      option?.ta_price ??
      option?.ots_price ??
      0
    );


  if (
    !/^ITEM-[A-Za-z0-9_-]+$/i.test(
      id
    ) ||
    status !== "ACTIVE" ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    return null;
  }


  return {
    id,
    name:
      String(
        option?.name ||
        id
      ).trim(),
    price,
    item_type_id:
      option?.item_type_id ??
      null,
    sequence_id:
      option?.sequence_id ??
      null,
  };

}


function normalizeGroups(
  item
) {

  const source =
    Array.isArray(
      item?.customizations
    )
      ? item.customizations
      : [];


  return source
    .map(
      (
        group,
        groupIndex
      ) => {

        const options =
          (
            Array.isArray(
              group?.options
            )
              ? group.options
              : []
          )
            .map(
              normalizeOption
            )
            .filter(Boolean);


        const minimum =
          Math.max(
            0,
            Number(
              group?.min_permitted ??
              0
            ) || 0
          );


        const maximumRaw =
          Number(
            group?.max_permitted
          );


        const maximum =
          Number.isFinite(
            maximumRaw
          )
            ? Math.max(
                minimum,
                maximumRaw
              )
            : options.length;


        return {

          key:
            `${groupIndex}:${String(
              group?.name ||
              "TUỲ CHỌN"
            )}`,

          name:
            String(
              group?.name ||
              "TUỲ CHỌN"
            ).trim(),

          minimum,

          maximum,

          options,

        };

      }
    )
    .filter(
      group =>
        group.options.length > 0
    );

}


function createInitialSelection(
  groups
) {

  const selected = {};


  for (
    const group
    of groups
  ) {

    /*
     * iPOS minimum is authoritative.
     *
     * Optional groups remain unselected, which preserves the
     * product's normal/default recipe. Required groups receive
     * the first N ACTIVE options deterministically.
     */
    selected[group.key] =
      group.minimum > 0
        ? group.options
            .slice(
              0,
              group.minimum
            )
            .map(
              option =>
                option.id
            )
        : [];

  }


  return selected;

}


export default function ProductOptionsModal({
  item,
  onClose,
}) {

  const addItem =
    useCartStore(
      state =>
        state.addItem
    );


  const groups =
    useMemo(
      () =>
        normalizeGroups(
          item
        ),
      [
        item,
      ]
    );


  const [
    selectedByGroup,
    setSelectedByGroup,
  ] = useState(
    () =>
      createInitialSelection(
        groups
      )
  );


  const [
    customNote,
    setCustomNote,
  ] = useState("");


  const [
    qty,
    setQty,
  ] = useState(1);


  const selectedOptions =
    useMemo(
      () => {

        const result = [];


        for (
          const group
          of groups
        ) {

          const selectedIds =
            new Set(
              selectedByGroup[
                group.key
              ] || []
            );


          for (
            const option
            of group.options
          ) {

            if (
              selectedIds.has(
                option.id
              )
            ) {

              result.push({

                group:
                  group.name,

                store_item_id:
                  option.id,

                name:
                  option.name,

                price:
                  option.price,

                item_type_id:
                  option.item_type_id,

                sequence_id:
                  option.sequence_id,

              });

            }

          }

        }


        return result;

      },
      [
        groups,
        selectedByGroup,
      ]
    );


  const customizationTotal =
    selectedOptions.reduce(
      (
        sum,
        option
      ) =>
        sum +
        Number(
          option.price || 0
        ),
      0
    );


  const unitPrice =
    Number(
      item?.price || 0
    ) +
    customizationTotal;


  const total =
    unitPrice *
    qty;


  const selectionValid =
    groups.every(
      group => {

        const count =
          (
            selectedByGroup[
              group.key
            ] || []
          ).length;


        return (
          count >=
            group.minimum &&
          count <=
            group.maximum
        );

      }
    );


  const toggleOption = (
    group,
    optionId
  ) => {

    setSelectedByGroup(
      previous => {

        const current =
          previous[
            group.key
          ] || [];


        const exists =
          current.includes(
            optionId
          );


        let next;


        if (
          group.maximum === 1
        ) {

          if (
            exists &&
            group.minimum === 0
          ) {
            next = [];
          } else {
            next = [
              optionId,
            ];
          }

        } else if (exists) {

          if (
            current.length <=
              group.minimum
          ) {
            return previous;
          }

          next =
            current.filter(
              id =>
                id !==
                optionId
            );

        } else {

          if (
            current.length >=
              group.maximum
          ) {
            return previous;
          }

          next = [
            ...current,
            optionId,
          ];

        }


        return {
          ...previous,
          [
            group.key
          ]: next,
        };

      }
    );

  };


  const handleAdd = () => {

    if (!selectionValid) {
      return;
    }


    const canonicalBaseId =
      String(
        item?.store_item_id ||
        item?.item_id ||
        ""
      ).trim();


    if (
      !/^ITEM-[A-Za-z0-9_-]+$/i.test(
        canonicalBaseId
      )
    ) {
      return;
    }


    const optionIds =
      selectedOptions.map(
        option =>
          option.store_item_id
      );


    const optionNote =
      selectedOptions
        .map(
          option =>
            option.name
        )
        .filter(Boolean)
        .join(", ");


    const cleanCustomNote =
      customNote
        .trim()
        .replace(
          /\s+/g,
          " "
        )
        .slice(
          0,
          120
        );


    const note =
      [
        optionNote,
        cleanCustomNote,
      ]
        .filter(Boolean)
        .join(" — ");


    addItem({

      /*
       * Presentation metadata may remain in the cart, but the
       * financial identifiers below are the only values the
       * canonical backend will trust.
       */
      ...item,

      id:
        canonicalBaseId,

      item_id:
        canonicalBaseId,

      store_item_id:
        canonicalBaseId,

      price:
        unitPrice,

      qty,

      quantity:
        qty,

      customization_option_ids:
        optionIds,

      customizations:
        selectedOptions,

      toppings:
        selectedOptions
          .filter(
            option =>
              String(
                option.group
              )
                .trim()
                .toUpperCase() ===
              "TOPPING"
          ),

      note,

      displayName:
        item.name +
        (
          optionNote
            ? ` (${optionNote})`
            : ""
        ),

      customNote:
        cleanCustomNote,

    });


    onClose();

  };


  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background:
            "rgba(0,0,0,0.5)",
          zIndex: 100,
        }}
      />

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 101,
          background: "white",
          borderRadius:
            "20px 20px 0 0",
          maxHeight: "85vh",
          overflowY: "auto",
          paddingBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            padding:
              "16px 16px 12px",
            borderBottom:
              "1px solid #f5f5f5",
            position: "sticky",
            top: 0,
            background: "white",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  objectFit:
                    "cover",
                }}
                onError={
                  event => {
                    event.currentTarget.style.display =
                      "none";
                  }
                }
              />
            )}

            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#1a1a1a",
                  margin: 0,
                }}
              >
                {item.name}
              </p>

              <p
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: "#D4531C",
                  margin: 0,
                }}
              >
                {fmt(
                  item.price
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius:
                "50%",
              background:
                "#f5f5f5",
              border: "none",
              fontSize: 16,
              cursor:
                "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding:
              "0 16px",
          }}
        >
          {groups.map(
            group => {

              const selected =
                selectedByGroup[
                  group.key
                ] || [];


              return (
                <Section
                  key={
                    group.key
                  }
                  title={
                    group.name
                  }
                  hint={
                    group.minimum >
                      0
                      ? `Chọn ${group.minimum}${
                          group.maximum !==
                          group.minimum
                            ? `–${group.maximum}`
                            : ""
                        }`
                      : group.maximum >
                          1
                        ? `Tối đa ${group.maximum}`
                        : null
                  }
                >
                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        group.maximum ===
                        1
                          ? "repeat(auto-fit,minmax(90px,1fr))"
                          : "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    {group.options.map(
                      option => {

                        const active =
                          selected.includes(
                            option.id
                          );


                        return (
                          <button
                            key={
                              option.id
                            }
                            onClick={
                              () =>
                                toggleOption(
                                  group,
                                  option.id
                                )
                            }
                            style={{
                              padding:
                                "8px 10px",
                              borderRadius:
                                10,
                              cursor:
                                "pointer",
                              border:
                                active
                                  ? "2px solid #D4531C"
                                  : "1.5px solid #e8e8e8",
                              background:
                                active
                                  ? "#fff5f2"
                                  : "white",
                              textAlign:
                                "left",
                            }}
                          >
                            <p
                              style={{
                                fontSize:
                                  11,
                                fontWeight:
                                  700,
                                color:
                                  "#1a1a1a",
                                margin:
                                  "0 0 2px",
                              }}
                            >
                              {
                                option.name
                              }
                            </p>

                            {option.price >
                              0 && (
                              <p
                                style={{
                                  fontSize:
                                    11,
                                  color:
                                    "#D4531C",
                                  margin:
                                    0,
                                  fontWeight:
                                    600,
                                }}
                              >
                                +
                                {fmt(
                                  option.price
                                )}
                              </p>
                            )}
                          </button>
                        );

                      }
                    )}
                  </div>
                </Section>
              );

            }
          )}

          <Section
            title="Ghi chú riêng cho cốc này"
          >
            <textarea
              value={
                customNote
              }
              onChange={
                event =>
                  setCustomNote(
                    event.target.value.slice(
                      0,
                      120
                    )
                  )
              }
              placeholder="Ví dụ: tách đá riêng..."
              rows={3}
              style={{
                width:
                  "100%",
                boxSizing:
                  "border-box",
                border:
                  "1.5px solid #e8e8e8",
                borderRadius:
                  12,
                padding:
                  "10px 12px",
                fontSize:
                  13,
                lineHeight:
                  1.4,
                outline:
                  "none",
                resize:
                  "none",
                fontFamily:
                  "inherit",
              }}
            />
          </Section>
        </div>

        <div
          style={{
            position:
              "sticky",
            bottom: 0,
            background:
              "white",
            padding:
              "12px 16px 0",
            borderTop:
              "1px solid #f5f5f5",
          }}
        >
          {!selectionValid && (
            <p
              style={{
                color:
                  "#e53935",
                fontSize:
                  11,
                margin:
                  "0 0 8px",
              }}
            >
              Vui lòng chọn đủ tuỳ chọn bắt buộc.
            </p>
          )}

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: 12,
              marginBottom:
                12,
            }}
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: 10,
              }}
            >
              <button
                onClick={
                  () =>
                    setQty(
                      value =>
                        Math.max(
                          1,
                          value - 1
                        )
                    )
                }
                style={{
                  width:
                    32,
                  height:
                    32,
                  borderRadius:
                    "50%",
                  border:
                    "1.5px solid #D4531C",
                  background:
                    "white",
                  color:
                    "#D4531C",
                  fontSize:
                    18,
                }}
              >
                −
              </button>

              <span
                style={{
                  fontSize:
                    16,
                  fontWeight:
                    900,
                  minWidth:
                    20,
                  textAlign:
                    "center",
                }}
              >
                {qty}
              </span>

              <button
                onClick={
                  () =>
                    setQty(
                      value =>
                        Math.min(
                          100,
                          value + 1
                        )
                    )
                }
                style={{
                  width:
                    32,
                  height:
                    32,
                  borderRadius:
                    "50%",
                  background:
                    "#D4531C",
                  border:
                    "none",
                  color:
                    "white",
                  fontSize:
                    18,
                }}
              >
                +
              </button>
            </div>

            <button
              onClick={
                handleAdd
              }
              disabled={
                !selectionValid
              }
              style={{
                flex: 1,
                padding:
                  "12px",
                borderRadius:
                  12,
                background:
                  selectionValid
                    ? "#D4531C"
                    : "#ddd",
                color:
                  "white",
                border:
                  "none",
                fontSize:
                  14,
                fontWeight:
                  900,
                cursor:
                  selectionValid
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              Thêm vào giỏ —{" "}
              {fmt(total)}
            </button>
          </div>
        </div>
      </div>
    </>
  );

}


function Section({
  title,
  hint = null,
  children,
}) {

  return (
    <div
      style={{
        marginTop: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          gap: 8,
          marginBottom:
            10,
        }}
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: "#999",
            margin: 0,
            textTransform:
              "uppercase",
            letterSpacing:
              0.5,
          }}
        >
          {title}
        </p>

        {hint && (
          <span
            style={{
              fontSize:
                10,
              color:
                "#aaa",
            }}
          >
            {hint}
          </span>
        )}
      </div>

      {children}
    </div>
  );

}
