import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "react-modal";
import { usePacking } from "../context/PackingContext";
import {
  fetchMockContainers,
  fetchMockCatalogItems,
  MOCK_CONTAINERS,
  MOCK_CATALOG_ITEMS,
} from "../services/mockCatalogService";
import {
  getPackCalcMaxUses,
  getPackCalcUsageCount,
  incrementPackCalcUsage,
  isPackCalcLimitReached,
} from "../lib/packCalcUsageLimit";
import type { CatalogItemPreset } from "../types/catalog";
import type { BauleraInput } from "../types/packing";
import { PackingScene3D } from "./PackingScene3D";

Modal.setAppElement("#root");

const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-50";

const btnSecondary =
  "inline-flex items-center justify-center rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500";

const btnGhost =
  "inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-700 hover:text-white";

const btnDanger =
  "inline-flex items-center justify-center rounded-md border border-red-900/60 bg-red-950/40 px-2 py-1 text-xs font-medium text-red-300 transition hover:bg-red-950/70";

const inputDark =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40";

/**
 * Panel principal — empaquetado 3D (UI estilo CRM oscuro).
 */
export default function Panel() {
  const {
    health,
    healthMessage,
    checkHealth,
    submitPack,
    packLoading,
    packError,
    packResponse,
    requestContainer,
  } = usePacking();

  const resultRef = useRef<HTMLInputElement | null>(null);
  const itemsSelectedTable = useRef<HTMLTableElement | null>(null);
  const itemsInput_w = useRef<HTMLInputElement | null>(null);
  const itemsInput_h = useRef<HTMLInputElement | null>(null);
  const itemsInput_d = useRef<HTMLInputElement | null>(null);
  const itemsInput_we = useRef<HTMLInputElement | null>(null);
  const itemsInput_name = useRef<HTMLInputElement | null>(null);
  const textAreaFitted = useRef<HTMLTextAreaElement | null>(null);
  const textAreaUnFitted = useRef<HTMLTextAreaElement | null>(null);

  interface Item {
    name: string;
    width: number;
    height: number;
    depth: number;
    weight: number;
    quantity: number;
  }

  const [itemsSelected, setItemsSelected] = useState<Item[]>([]);
  const [containerSelected, setContainerSelected] = useState<BauleraInput>();
  const [containersList, setContainersList] = useState<BauleraInput[]>([]);
  const [itemsPrev, setItemsPrev] = useState<CatalogItemPreset[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setCatalogLoading(true);
    setCatalogError(null);
    Promise.all([fetchMockContainers(), fetchMockCatalogItems()])
      .then(([containers, items]) => {
        if (!cancelled) {
          setContainersList(containers);
          setItemsPrev(items);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : "Error al cargar el catálogo";
          setCatalogError(msg);
          setContainersList([...MOCK_CONTAINERS]);
          setItemsPrev([...MOCK_CATALOG_ITEMS]);
        }
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!packResponse) return;
    if (resultRef.current) {
      const n = packResponse.unfittedItems.length;
      resultRef.current.value =
        n === 0
          ? "Entra todo"
          : n === 1
            ? "Queda 1 ítem fuera del contenedor seleccionado"
            : `Quedan ${n} ítems fuera del contenedor seleccionado`;
    }
    if (textAreaFitted.current && textAreaUnFitted.current) {
      textAreaFitted.current.value = packResponse.fittedItems.reduce(
        (acc: string, item: { detail?: string }) =>
          acc + (item.detail ?? "") + "\n\n",
        ""
      );
      textAreaUnFitted.current.value = packResponse.unfittedItems.reduce(
        (acc: string, item: { detail?: string }) =>
          acc + (item.detail ?? "") + "\n\n",
        ""
      );
    }
  }, [packResponse]);

  const openItemModal = () => setItemModalOpen(true);
  const closeItemModal = () => setItemModalOpen(false);
  const closeViewerModal = () => setViewerModalOpen(false);

  const DropRowToList = async (name: string) => {
    setItemsSelected((prevItems) => prevItems.filter((item) => item.name !== name));
  };

  const AddRowToList = async (
    name: string,
    w: number,
    h: number,
    d: number,
    we: number,
    _index: number
  ) => {
    const qty = Number(
      (document.getElementsByName("quantity-item")[_index] as HTMLInputElement)
        .value
    );

    const newItem: Item = {
      name,
      width: w,
      height: h,
      depth: d,
      weight: we,
      quantity: qty,
    };

    const existingItem = itemsSelected.find(
      (item) =>
        item.name === newItem.name &&
        item.width === newItem.width &&
        item.height === newItem.height &&
        item.depth === newItem.depth &&
        item.weight === newItem.weight
    );

    if (existingItem) {
      setItemsSelected(
        itemsSelected.map((item) =>
          item.name === existingItem.name
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      );
    } else {
      setItemsSelected((prevItems) => [...prevItems, newItem]);
    }
  };

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (itemsSelected.length === 0) {
      alert("No se ingresaron Items a la lista");
      return false;
    }
    if (!containerSelected) {
      alert("Seleccioná un contenedor");
      return false;
    }

    if (isPackCalcLimitReached()) {
      const max = getPackCalcMaxUses();
      alert(
        `Alcanzaste el máximo de ${max} cálculo${max === 1 ? "" : "s"} permitido${max === 1 ? "" : "s"}.`
      );
      return false;
    }

    const data = {
      baulera: containerSelected,
      items: itemsSelected,
    };
    try {
      await submitPack(data);
      incrementPackCalcUsage();
    } catch (error) {
      const msg = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ??
          error.message
        : error instanceof Error
          ? error.message
          : "Error al empaquetar";
      alert(msg);
    }
  };

  function selectContainer(index: number): void {
    setContainerSelected(containersList[index]);
  }

  function AddItem() {
    const name_i = itemsInput_name.current?.value;
    const w_i = itemsInput_w.current?.value;
    const h_i = itemsInput_h.current?.value;
    const d_i = itemsInput_d.current?.value;
    const we_i = itemsInput_we.current?.value;

    const item_name =
      name_i + " - " + w_i + "x" + h_i + "x" + d_i + " " + we_i + "kg";

    const newItem: CatalogItemPreset = {
      name: item_name,
      width: Number(w_i) / 100,
      height: Number(h_i) / 100,
      depth: Number(d_i) / 100,
      weight: Number(we_i) / 100,
    };

    setItemsPrev((prevItems) => [...prevItems, newItem]);
    closeItemModal();
  }

  const dropItemPrev = (name: string) => {
    setItemsPrev((prevItems) => prevItems.filter((item) => item.name !== name));
  };

  const canExpandViewer = Boolean(requestContainer && packResponse);

  /** Peso total = suma (peso × cantidad) por línea. */
  const totalWeightKg = useMemo(
    () =>
      itemsSelected.reduce(
        (sum, item) => sum + item.weight * item.quantity,
        0
      ),
    [itemsSelected]
  );

  /** Unidades totales = suma de cantidades por línea. */
  const totalUnits = useMemo(
    () =>
      itemsSelected.reduce((sum, item) => sum + item.quantity, 0),
    [itemsSelected]
  );

  /** Volumen total (m³) = suma (ancho × alto × profundo × cantidad) por línea. */
  const totalVolumeM3 = useMemo(
    () =>
      itemsSelected.reduce(
        (sum, item) =>
          sum +
          item.width *
            item.height *
            item.depth *
            item.quantity,
        0
      ),
    [itemsSelected]
  );

  const weightLimitKg = containerSelected?.weightLimit ?? null;
  const weightExceeded =
    weightLimitKg != null && totalWeightKg > weightLimitKg;

  const packCalcMaxUses = getPackCalcMaxUses();
  const packCalcUsed = getPackCalcUsageCount();
  const packCalcLimitReached = isPackCalcLimitReached();

  const apiBadgeClass =
    health === "ok"
      ? "border-emerald-800/80 bg-emerald-950/50 text-emerald-200"
      : health === "error"
        ? "border-red-800/80 bg-red-950/40 text-red-200"
        : "border-zinc-700 bg-zinc-800/80 text-zinc-400";

  return (
    <>
      <section className="mx-auto max-w-[1400px] px-4 py-6 text-left sm:px-6">
        <header className="mb-6 border-b border-zinc-800 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${apiBadgeClass}`}
            >
              <span className="text-zinc-500">API</span>
              {health === "unknown"
                ? "comprobando…"
                : health === "ok"
                  ? "Conectado"
                  : `Error${healthMessage ? ` — ${healthMessage}` : ""}`}
            </span>
            <button
              type="button"
              className={btnSecondary}
              onClick={() => void checkHealth()}
            >
              Reintentar
            </button>
          </div>
          {packError ? (
            <p className="mt-3 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
              {packError}
            </p>
          ) : null}
        </header>

        <form
          className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:grid-rows-[minmax(260px,auto)_minmax(300px,auto)]"
          onSubmit={handleSubmit}
        >
          {/* Q1: contenedor + catálogo */}
          <div className="flex min-h-0 min-w-0 flex-col gap-6 overflow-auto rounded-xl border border-zinc-700/90 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 p-5 shadow-crm ring-1 ring-white/5">
            <header className="border-b border-zinc-800 pb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-500/90">
                Configuración de carga
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-zinc-50">
                Contenedor y catálogo
              </h3>
              <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-zinc-500">
                Definí el contenedor y elegí ítems del catálogo para armar la lista que se enviará al cálculo.
              </p>
            </header>

            <section aria-labelledby="q1-contenedor-heading" className="space-y-3">
              <div>
                <h4
                  id="q1-contenedor-heading"
                  className="text-sm font-semibold text-zinc-200"
                >
                  Contenedor
                </h4>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Volumen y peso máximo del contenedor (referencia en cm en el nombre).
                </p>
              </div>
              {catalogLoading ? (
                <p className="rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-500">
                  Cargando opciones…
                </p>
              ) : null}
              {catalogError ? (
                <p className="rounded-md border border-amber-900/40 bg-amber-950/25 px-3 py-2 text-xs leading-relaxed text-amber-200/95">
                  <span className="font-medium text-amber-100/90">Catálogo de prueba.</span>{" "}
                  {catalogError} Se muestran datos locales.
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {containersList.map((opcion, index) => (
                  <label
                    key={`container-${index}`}
                    htmlFor={`contenedor_${index}`}
                    className="inline-flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-600/90 bg-zinc-800/80 px-3.5 py-2 text-sm text-zinc-200 shadow-sm transition hover:border-zinc-500 hover:bg-zinc-800 has-[:checked]:border-emerald-500/80 has-[:checked]:bg-emerald-950/50 has-[:checked]:text-emerald-50 has-[:checked]:shadow-[0_0_0_1px_rgba(16,185,129,0.25)]"
                  >
                    <input
                      id={`contenedor_${index}`}
                      type="radio"
                      name="container-choice"
                      className="h-4 w-4 shrink-0 accent-emerald-500"
                      onChange={() => selectContainer(index)}
                      required
                    />
                    <span className="select-none">{opcion.name}</span>
                  </label>
                ))}
              </div>
            </section>

            <div className="h-px bg-zinc-800/90" aria-hidden />

            <section aria-labelledby="q1-catalogo-heading" className="space-y-3">
              <div>
                <h4
                  id="q1-catalogo-heading"
                  className="text-sm font-semibold text-zinc-200"
                >
                  Catálogo de ítems
                </h4>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Indicá la cantidad y pulsá{" "}
                  <span className="rounded border border-zinc-600 bg-zinc-800 px-1 py-px font-mono text-[10px] text-zinc-300">
                    +
                  </span>{" "}
                  para sumarlos a la lista de seleccionados. Podés crear un tipo nuevo abajo.
                </p>
              </div>
              <div className="overflow-hidden rounded-lg border border-zinc-700/90 shadow-inner">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-700 bg-zinc-900/95">
                      <th
                        scope="col"
                        className="w-10 px-2 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500"
                      >
                        <span className="sr-only">Eliminar del catálogo</span>
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500"
                      >
                        Descripción
                      </th>
                      <th
                        scope="col"
                        className="w-[1%] whitespace-nowrap px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-zinc-500"
                      >
                        Cant. · Añadir
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/90">
                    {itemsPrev.map((item, index) => (
                      <tr
                        key={item.name + index}
                        id={`li-item-${index}`}
                        className="transition-colors hover:bg-zinc-800/35"
                      >
                        <td className="px-2 py-2.5 align-middle">
                          <button
                            type="button"
                            className={btnDanger}
                            onClick={() => dropItemPrev(item.name)}
                            aria-label={`Quitar ${item.name} del catálogo`}
                          >
                            ×
                          </button>
                        </td>
                        <td className="max-w-[1px] px-3 py-2.5">
                          <span className="line-clamp-2 text-zinc-300" title={item.name}>
                            {item.name}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right">
                          <input
                            type="text"
                            inputMode="numeric"
                            name="quantity-item"
                            defaultValue="1"
                            className="mr-2 inline-block w-11 rounded-md border border-zinc-600 bg-zinc-950 px-1.5 py-1.5 text-center text-xs tabular-nums text-zinc-100 outline-none focus:border-emerald-600/60 focus:ring-1 focus:ring-emerald-500/30"
                          />
                          <button
                            id={`btn-item-${index}`}
                            type="button"
                            className={`${btnGhost} min-w-[2rem] px-2.5 font-semibold`}
                            onClick={() =>
                              AddRowToList(
                                item.name,
                                item.width,
                                item.height,
                                item.depth,
                                item.weight,
                                index
                              )
                            }
                            aria-label={`Añadir ${item.name} a la lista`}
                          >
                            +
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-zinc-800 bg-zinc-900/40 px-3 py-3">
                  <button
                    type="button"
                    className={btnSecondary}
                    onClick={openItemModal}
                  >
                    + Crear ítem personalizado
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Q2: seleccionados */}
          <div className="min-w-0 overflow-auto rounded-xl border border-zinc-700/90 bg-zinc-950/80 p-5 shadow-crm ring-1 ring-white/5">
            <h3 className="mb-3 text-base font-semibold tracking-tight text-zinc-100">
              Ítems seleccionados
            </h3>
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 text-xs text-zinc-400 sm:text-sm">
              <div className="flex items-baseline gap-1.5">
                <span className="text-zinc-500">Cantidad cargada</span>
                <span className="font-mono font-semibold tabular-nums text-zinc-100">
                  {totalUnits}
                </span>
                <span className="text-zinc-600">u.</span>
              </div>
              <span className="hidden text-zinc-700 sm:inline">|</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-zinc-500">Volumen total</span>
                <span className="font-mono font-semibold tabular-nums text-zinc-100">
                  {totalVolumeM3.toFixed(3)}
                </span>
                <span className="text-zinc-600">m³</span>
              </div>
              <span className="hidden text-zinc-700 sm:inline">|</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-zinc-500">Peso total</span>
                <span className="font-mono font-semibold tabular-nums text-zinc-100">
                  {totalWeightKg.toFixed(2)}
                </span>
                <span className="text-zinc-600">kg</span>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-zinc-800">
              <table
                id="items-selected"
                ref={itemsSelectedTable}
                className="w-full min-w-[520px] border-collapse text-left text-sm"
              >
                <thead>
                  <tr className="border-b border-zinc-700 bg-zinc-900/90">
                    <th className="px-3 py-3 font-semibold text-zinc-400">
                      Descrip.
                    </th>
                    <th className="px-3 py-3 font-semibold text-zinc-400">
                      Ancho (m)
                    </th>
                    <th className="px-3 py-3 font-semibold text-zinc-400">
                      Alto (m)
                    </th>
                    <th className="px-3 py-3 font-semibold text-zinc-400">
                      Prof. (m)
                    </th>
                    <th className="px-3 py-3 font-semibold text-zinc-400">
                      Peso (kg)
                    </th>
                    <th className="px-3 py-3 font-semibold text-zinc-400">
                      Cant.
                    </th>
                    <th className="w-12 px-2 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {itemsSelected.map((item, index) => (
                    <tr
                      key={item.name + index}
                      id={`sel-item_${index}`}
                      className="border-b border-zinc-800/90 transition hover:bg-zinc-800/50"
                    >
                      <td className="px-3 py-2.5 text-zinc-200">{item.name}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-zinc-400">
                        {item.width}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-zinc-400">
                        {item.height}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-zinc-400">
                        {item.depth}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-zinc-400">
                        {item.weight}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-zinc-400">
                        {item.quantity}
                      </td>
                      <td className="px-2 py-2.5">
                        <button
                          type="button"
                          className={btnDanger}
                          onClick={() => DropRowToList(item.name)}
                          aria-label="Eliminar fila"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Q3: resultados */}
          <div className="flex min-h-0 min-w-0 flex-col gap-4 overflow-auto rounded-xl border border-zinc-700/90 bg-zinc-900/70 p-5 shadow-crm ring-1 ring-white/5">
            <h3 className="text-base font-semibold tracking-tight text-zinc-100">
              Resultado del cálculo
            </h3>
            <div
              className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border px-3 py-2.5 text-sm ${
                weightExceeded
                  ? "border-red-800/70 bg-red-950/25"
                  : "border-zinc-700/80 bg-zinc-950/60"
              }`}
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-zinc-500">Peso total ítems</span>
                <span className="font-mono font-semibold tabular-nums text-zinc-100">
                  {totalWeightKg.toFixed(2)} kg
                </span>
              </div>
              <span className="hidden text-zinc-600 sm:inline">·</span>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-zinc-500">Límite contenedor</span>
                <span className="font-mono font-semibold tabular-nums text-zinc-100">
                  {weightLimitKg != null ? `${weightLimitKg} kg` : "—"}
                </span>
              </div>
              {weightExceeded ? (
                <span
                  className="inline-flex items-center rounded-md border border-red-600 bg-red-950/60 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-red-400"
                  role="status"
                >
                  Peso excedido
                </span>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={packLoading || packCalcLimitReached}
                  className={btnPrimary}
                >
                  {packLoading ? "Calculando…" : "Calcular espacio"}
                </button>
                <input
                  ref={resultRef}
                  type="text"
                  readOnly
                  placeholder="Estado del empaquetado"
                  className="min-w-[200px] flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600"
                />
              </div>
              {packCalcMaxUses != null ? (
                <p
                  className={`text-xs ${
                    packCalcLimitReached
                      ? "font-medium text-red-400"
                      : "text-zinc-500"
                  }`}
                >
                  Límite de uso (este navegador):{" "}
                  <span className="font-mono tabular-nums text-zinc-300">
                    {packCalcUsed}/{packCalcMaxUses}
                  </span>{" "}
                  cálculos exitosos
                  {packCalcLimitReached
                    ? " — límite alcanzado"
                    : packCalcMaxUses > packCalcUsed
                      ? ` — quedan ${packCalcMaxUses - packCalcUsed}`
                      : null}
                </p>
              ) : null}
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Ítems que entran en el contenedor
              </label>
              <textarea
                ref={textAreaFitted}
                readOnly
                rows={8}
                className="min-h-[120px] flex-1 resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-300"
              />
            </div>
            <div className="flex min-h-0 flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Ítems que no entran
              </label>
              <textarea
                ref={textAreaUnFitted}
                readOnly
                rows={5}
                className="min-h-[96px] resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-300"
              />
            </div>
          </div>

          {/* Q4: 3D */}
          <div className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-800 bg-black/30 p-5 shadow-crm ring-1 ring-white/5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-semibold tracking-tight text-zinc-100">
                Vista 3D
              </h3>
              <button
                type="button"
                disabled={!canExpandViewer}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-200 transition hover:border-emerald-500/50 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => setViewerModalOpen(true)}
              >
                Ampliar vista
              </button>
            </div>
            <div className="flex min-h-[280px] flex-1 flex-col">
              <PackingScene3D
                requestContainer={requestContainer}
                packResponse={packResponse}
                canvasHeight={320}
              />
            </div>
          </div>
        </form>
      </section>

      <Modal
        isOpen={viewerModalOpen}
        onRequestClose={closeViewerModal}
        overlayClassName="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm"
        className="fixed inset-3 flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 outline-none sm:inset-4 md:inset-6"
        contentLabel="Vista 3D ampliada"
      >
        <div className="relative flex min-h-0 flex-1 flex-col">
          <button
            type="button"
            className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/95 text-xl leading-none text-zinc-200 shadow-lg transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
            onClick={closeViewerModal}
            aria-label="Cerrar"
          >
            ×
          </button>
          <div className="flex min-h-0 flex-1 flex-col pt-1">
            <PackingScene3D
              requestContainer={requestContainer}
              packResponse={packResponse}
              canvasHeight="calc(100dvh - 2.5rem)"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={itemModalOpen}
        onRequestClose={closeItemModal}
        overlayClassName="fixed inset-0 z-[900] flex items-center justify-center bg-zinc-950/85 p-4 backdrop-blur-sm"
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-6 text-zinc-100 shadow-crm outline-none"
        contentLabel="Nuevo ítem"
      >
        <div className="mb-4 flex items-center justify-between gap-2 border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-50">
              Nuevo ítem
            </h3>
            <p className="mt-0.5 text-sm text-zinc-500">
              Medidas en centímetros
            </p>
          </div>
          <button
            type="button"
            className={btnGhost}
            onClick={closeItemModal}
          >
            Cerrar
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
              Nombre
            </label>
            <input
              ref={itemsInput_name}
              type="text"
              placeholder="Cajonera chica"
              name="nombre_i"
              className={inputDark}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                Ancho
              </label>
              <input
                ref={itemsInput_w}
                type="number"
                min={0}
                defaultValue={0}
                name="width_i"
                className={inputDark}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                Alto
              </label>
              <input
                ref={itemsInput_h}
                type="number"
                min={0}
                defaultValue={0}
                name="height_i"
                className={inputDark}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                Profundo
              </label>
              <input
                ref={itemsInput_d}
                type="number"
                min={0}
                defaultValue={0}
                name="depth_i"
                className={inputDark}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                Peso (kg)
              </label>
              <input
                ref={itemsInput_we}
                type="number"
                min={0}
                defaultValue={0}
                name="weight_i"
                className={inputDark}
              />
            </div>
          </div>
          <button
            type="button"
            className={`${btnPrimary} w-full`}
            onClick={() => AddItem()}
          >
            Agregar al catálogo
          </button>
        </div>
      </Modal>
    </>
  );
}
