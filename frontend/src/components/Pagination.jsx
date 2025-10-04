import { useMemo } from 'react'

export default function Pagination({
  canPrev,
  canNext,
  onPrev,
  onNext,
  onSelect,
  pages,
  current,
}) {
  const calculatedPages = useMemo(() => {
    const total = pages.length
    const maxNumbers = 5
    if (total <= maxNumbers) return pages

    const first = pages[0]
    const last = pages[total - 1]
    const middleSlots = maxNumbers - 2

    let start = Math.max(first + 1, current - Math.floor(middleSlots / 2))
    let end = start + middleSlots - 1

    if (end >= last) {
      end = last - 1
      start = end - middleSlots + 1
    }

    if (start <= first) {
      start = first + 1
      end = start + middleSlots - 1
    }

    const middle = []
    for (let value = start; value <= end; value += 1) {
      middle.push(value)
    }

    const sequence = [first]

    if (middle.length && middle[0] > first + 1) {
      sequence.push('ellipsis-left')
    }

    sequence.push(...middle)

    if (middle.length && middle[middle.length - 1] < last - 1) {
      sequence.push('ellipsis-right')
    }

    sequence.push(last)

    return sequence
  }, [pages, current])

  return (
    <div className="mx-auto mt-4 w-full max-w-4xl px-4">
      <div className="grid w-full grid-cols-1 items-center gap-3 sm:flex sm:flex-row sm:items-center sm:justify-between">
        <button
          className={`order-2 w-full rounded-md border border-brand/30 bg-brand/20 px-3 py-2 text-sm font-medium text-white transition-transform duration-200 sm:order-none sm:w-[6.5rem] ${canPrev ? 'hover:scale-[1.02] active:scale-95' : 'opacity-40 cursor-not-allowed'}`}
          onClick={canPrev ? onPrev : undefined}
          type="button"
          disabled={!canPrev}
        >
          Anterior
        </button>

        <div className="order-1 flex items-center justify-center gap-1 sm:order-none">
          {calculatedPages.map((page, index) => {
            if (typeof page === 'string') {
              return (
                <span key={`${page}-${index}`} className="px-2 text-sm text-gray-500">
                  …
                </span>
              )
            }
            const active = page === current
            return (
              <button
                key={page}
                type="button"
                onClick={() => onSelect(page)}
                className={`min-w-[2.5rem] rounded-md border px-3 py-1 text-sm transition-colors ${
                  active
                    ? 'border-brand/60 bg-brand text-white shadow-[0_12px_28px_-16px_rgba(8,180,216,0.85)]'
                    : 'border-gray-700 text-gray-300 hover:border-brand/40 hover:text-brand'
                }`}
              >
                {page}
              </button>
            )
          })}
        </div>

        <button
          className={`order-3 w-full rounded-md border border-brand/30 bg-brand px-3 py-2 text-sm font-medium text-white transition-transform duration-200 sm:order-none sm:w-[6.5rem] ${canNext ? 'hover:scale-[1.02] active:scale-95' : 'opacity-40 cursor-not-allowed'}`}
          onClick={canNext ? () => onNext(current + 1) : undefined}
          type="button"
          disabled={!canNext}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
