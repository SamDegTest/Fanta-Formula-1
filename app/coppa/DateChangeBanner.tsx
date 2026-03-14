'use client';

import { Bell, X } from 'lucide-react';
import React from 'react';

interface DateChangeBannerProps {
    dateChangeInfo: {
        from: {
            meeting_name: string;
            country_name: string;
            date_start: string;
        };
        to: {
            meeting_name: string;
            country_name: string;
            date_start: string;
        };
    };
    onDismiss: () => void;
}

const DateChangeBanner = ({ dateChangeInfo, onDismiss }: DateChangeBannerProps) => {
    const { from, to } = dateChangeInfo;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-lg shadow-lg flex items-center justify-between space-x-4 animate-fade-in-down mb-4">
            <div className="flex items-center space-x-3">
                <Bell className="h-6 w-6" />
                <p className="font-semibold">
                    Attenzione: La prima giornata della coppa è stata spostata!
                    <span className="font-normal ml-2">
                        Dal GP di <span className="font-bold">{from.meeting_name}</span> ({from.country_name}) del {formatDate(from.date_start)} al GP di <span className="font-bold">{to.meeting_name}</span> ({to.country_name}) del {formatDate(to.date_start)}.
                    </span>
                </p>
            </div>
            <button
                onClick={onDismiss}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Nascondi notifica"
            >
                <X className="h-5 w-5" />
            </button>
        </div>
    );
};

export default DateChangeBanner;
