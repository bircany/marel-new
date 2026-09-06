'use client';

import { useEffect, useRef } from 'react';
import intlTelInput, { type Instance as IntlTelInstance } from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css';

interface IntlPhoneInputProps {
    value: string;
    onChange: (value: string, isValid: boolean) => void;
    required?: boolean;
    defaultCountry?: string;
    placeholder?: string;
    className?: string;
}

export default function IntlPhoneInput({
    value,
    onChange,
    required = false,
    defaultCountry = 'tr',
    placeholder = '555 555 55 55',
    className = 'input',
}: IntlPhoneInputProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const itiRef = useRef<IntlTelInstance | null>(null);
    const onChangeRef = useRef(onChange);
    const requiredRef = useRef(required);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        requiredRef.current = required;
    }, [required]);

    useEffect(() => {
        const inputEl = inputRef.current;
        if (!inputEl) return;

        const iti = intlTelInput(inputEl, {
            initialCountry: defaultCountry,
            nationalMode: false,
            autoPlaceholder: 'aggressive',
            formatAsYouType: true,
            strictMode: true,
            loadUtils: () => import('intl-tel-input/utils'),
        });

        itiRef.current = iti;

        const emitChange = () => {
            const raw = inputEl.value.trim();
            if (!raw) {
                onChangeRef.current('', !requiredRef.current);
                return;
            }

            const fullIntl = iti.getNumber();
            onChangeRef.current(fullIntl, iti.isValidNumber());
        };

        inputEl.addEventListener('input', emitChange);
        inputEl.addEventListener('countrychange', emitChange);
        inputEl.addEventListener('blur', emitChange);

        return () => {
            inputEl.removeEventListener('input', emitChange);
            inputEl.removeEventListener('countrychange', emitChange);
            inputEl.removeEventListener('blur', emitChange);
            iti.destroy();
            itiRef.current = null;
        };
    }, [defaultCountry]);

    useEffect(() => {
        const iti = itiRef.current;
        const inputEl = inputRef.current;
        if (!iti || !inputEl) return;

        // Kullanıcı yazarken dış state sync'i ile input'u resetlemeyelim.
        if (document.activeElement === inputEl) return;

        const current = iti.getNumber();
        const incoming = value?.trim() ?? '';
        if (!incoming) {
            inputEl.value = '';
            return;
        }

        if (incoming && incoming !== current) {
            iti.setNumber(incoming);
        }
    }, [value]);

    return (
        <input
            ref={inputRef}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={placeholder}
            className={className}
        />
    );
}
