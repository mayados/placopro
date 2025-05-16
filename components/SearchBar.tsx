"use client";

import { faMagnifyingGlass, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

type SearchBarProps = {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    id?: string;
    onClear?: () => void;
};

export default function SearchBar({
    value,
    onChange,
    placeholder = "Rechercher...",
    id = "site-search",
    onClear,
}: SearchBarProps) {
    const handleClear = () => {
        if (onClear) onClear();
    };

    return (
        <form role="search" className="flex justify-center mb-4 w-full max-w-md mx-auto">
            <label htmlFor={id} className="sr-only">
                Recherche
            </label>
            <div className="relative w-full">
                <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    aria-hidden="true"
                />

                <input
                    type="text"
                    id={id}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1873BF] text-gray-800"
                    aria-label={placeholder}
                    tabIndex={0}
                />

                {/* erase button (cross) */}
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 focus:ring-2 focus:ring-offset-2 focus:ring-[#1873BF] rounded-full"
                        aria-label="Effacer la recherche"
                    >
                        <FontAwesomeIcon icon={faCircleXmark} />
                    </button>
                )}

            </div>
        </form>
    );
}
