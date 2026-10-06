import { useEffect, useState } from 'react';
import { workDaysPerMonthFromWeeks } from '../lib/transport';

const STORAGE_KEY = 'observatorio:transport-preferences:v1';

interface TransportScenarioOptions {
  readonly routeIds: readonly string[];
  readonly defaultRouteId: string;
  readonly defaultTrips: number;
  readonly defaultSalary: number;
}

export function useTransportScenario({
  routeIds,
  defaultRouteId,
  defaultTrips,
  defaultSalary,
}: TransportScenarioOptions) {
  const [routeId, setRouteId] = useState(defaultRouteId);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [trips, setTrips] = useState(defaultTrips);
  const [people, setPeople] = useState(1);
  const [salary, setSalary] = useState(defaultSalary);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const days = workDaysPerMonthFromWeeks(daysPerWeek);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<{
          routeId: string;
          daysPerWeek: number;
          trips: number;
          people: number;
          salary: number;
        }>;
        if (typeof saved.routeId === 'string' && routeIds.includes(saved.routeId)) setRouteId(saved.routeId);
        const savedDaysPerWeek = typeof saved.daysPerWeek === 'number' && Number.isFinite(saved.daysPerWeek) ? saved.daysPerWeek : null;
        const savedTrips = typeof saved.trips === 'number' && Number.isFinite(saved.trips) ? saved.trips : null;
        const savedPeople = typeof saved.people === 'number' && Number.isFinite(saved.people) ? saved.people : null;
        const savedSalary = typeof saved.salary === 'number' && Number.isFinite(saved.salary) ? saved.salary : null;

        if (savedDaysPerWeek !== null) setDaysPerWeek(Math.min(7, Math.max(1, Math.trunc(savedDaysPerWeek))));
        if (savedTrips !== null) setTrips(Math.min(8, Math.max(1, Math.trunc(savedTrips))));
        if (savedPeople !== null) setPeople(Math.min(20, Math.max(1, Math.trunc(savedPeople))));
        if (savedSalary !== null) setSalary(Math.min(1_000_000, Math.max(1, savedSalary)));
      }
    } catch {
      // Preferências locais são opcionais; um cache inválido não impede a calculadora.
    } finally {
      setPreferencesLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ routeId, daysPerWeek, trips, people, salary }));
    } catch {
      // Armazenamento local pode estar indisponível em navegação privada ou políticas restritivas.
    }
  }, [preferencesLoaded, routeId, daysPerWeek, trips, people, salary]);

  const resetScenario = () => {
    setRouteId(defaultRouteId);
    setDaysPerWeek(5);
    setTrips(defaultTrips);
    setPeople(1);
    setSalary(defaultSalary);
  };

  return {
    routeId,
    setRouteId,
    daysPerWeek,
    setDaysPerWeek,
    days,
    trips,
    setTrips,
    people,
    setPeople,
    salary,
    setSalary,
    resetScenario,
  };
}
