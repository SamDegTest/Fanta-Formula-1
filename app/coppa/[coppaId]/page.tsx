'use client';

import React, { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Loader, Trophy, Users, Swords, Calendar } from 'lucide-react';

import Classifica from '../Classifica';

import Tabellone from '../Tabellone';

import ProssimiScontriBanner from '../ProssimiScontriBanner';

const CoppaDashboardPage = () => {
  const params = useParams();
  const coppaId = params.coppaId as string;

  const [cup, setCup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (coppaId) {
      const fetchCupData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/coppa?id=${coppaId}`);
          if (response.status === 404) {
            notFound();
            return;
          }
          if (!response.ok) {
            throw new Error('Errore nel caricamento dei dati della coppa');
          }
          const data = await response.json();
          setCup(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchCupData();
    }
  }, [coppaId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="h-16 w-16 text-[#F5A623] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 px-6 bg-red-900/20">
        <h3 className="text-xl font-bold text-red-400">Errore</h3>
        <p className="text-red-300 mt-2">{error}</p>
      </div>
    );
  }

  if (!cup) {
    return null; // or notFound() depending on desired behavior
  }

  return (
    <div className="container mx-auto p-4 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-black text-[#F5A623] uppercase tracking-wider">{cup.name}</h1>
            <div className="flex items-center space-x-4 text-slate-300">
                <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>{cup.participants.length} Partecipanti</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Swords className="h-5 w-5" />
                    <span>{cup.matches.length} Match</span>
                </div>
                 <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>{new Date(cup.creationDate).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
      
        <ProssimiScontriBanner matches={cup.matches} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
                <Tabellone cup={cup} />
            </div>
            <div>
                <Classifica participants={cup.participants} />
            </div>
        </div>
    </div>
  );
};

export default CoppaDashboardPage;
