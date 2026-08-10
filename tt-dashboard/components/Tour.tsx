'use client';

import { useState, useEffect, useCallback } from 'react';

export interface TourStep {
  selector: string;
  title: string;
  text: string;
}

interface Props {
  steps: TourStep[];
  active: boolean;
  onClose: () => void;
}

interface SpotlightRect { top: number; left: number; width: number; height: number; }
interface PopoverPos { top: number; left: number; }

export default function Tour({ steps, active, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [popoverPos, setPopoverPos] = useState<PopoverPos>({ top: 0, left: 0 });
  const [stepTitle, setStepTitle] = useState('');
  const [stepText, setStepText] = useState('');

  const posicionarPasso = useCallback((idx: number) => {
    const step = steps[idx];
    if (!step) return;
    const el = document.querySelector(step.selector);
    if (!el) {
      if (idx < steps.length - 1) posicionarPasso(idx + 1);
      else onClose();
      return;
    }
    el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'auto' });
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const pad = 6;
      setSpotlight({ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 });
      setStepTitle(step.title);
      setStepText(step.text);

      requestAnimationFrame(() => {
        const pop = document.getElementById('tourPopover');
        if (!pop) return;
        const margin = 14;
        const vw = window.innerWidth, vh = window.innerHeight;
        const popRect = pop.getBoundingClientRect();
        let top = rect.bottom + margin;
        if (top + popRect.height > vh - 10) top = rect.top - popRect.height - margin;
        if (top < 10) top = 10;
        let left = rect.left;
        if (left + popRect.width > vw - 10) left = vw - popRect.width - 10;
        if (left < 10) left = 10;
        setPopoverPos({ top, left });
      });
    });
  }, [steps, onClose]);

  useEffect(() => {
    if (active) { setIndex(0); posicionarPasso(0); }
  }, [active, posicionarPasso]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    const onResize = () => posicionarPasso(index);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); };
  });

  function goNext() {
    if (index < steps.length - 1) { const next = index + 1; setIndex(next); posicionarPasso(next); }
    else onClose();
  }
  function goPrev() {
    if (index > 0) { const prev = index - 1; setIndex(prev); posicionarPasso(prev); }
  }

  if (!active) return null;

  return (
    <>
      <div className="tour-shield is-active" onClick={onClose} />
      {spotlight && (
        <div
          className="tour-spotlight is-active"
          style={{ top: spotlight.top, left: spotlight.left, width: spotlight.width, height: spotlight.height }}
        />
      )}
      <div
        id="tourPopover"
        className="tour-popover is-active"
        style={{ top: popoverPos.top, left: popoverPos.left }}
        role="dialog"
        aria-modal
        aria-labelledby="tourTitle"
        aria-describedby="tourText"
      >
        <button className="tour-close" onClick={onClose} aria-label="Fechar guia">×</button>
        <div className="tour-step-count">Passo {index + 1} de {steps.length}</div>
        <div className="tour-title" id="tourTitle">{stepTitle}</div>
        <div className="tour-text" id="tourText">{stepText}</div>
        <div className="tour-footer">
          <button className="tour-skip" onClick={onClose}>Pular tour</button>
          <div className="tour-nav">
            <button className="tour-btn tour-btn-ghost" onClick={goPrev} disabled={index === 0}>Anterior</button>
            <button className="tour-btn tour-btn-solid" onClick={goNext}>
              {index === steps.length - 1 ? 'Concluir' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
