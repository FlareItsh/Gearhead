import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

interface PaginationProps {
  links: PaginationLink[]
  onPageChange: (url: string) => void
}

export default function Pagination({ links, onPageChange }: PaginationProps) {
  if (links.length <= 3) return null // Hide if only Prev/Next and no pages (or single page) - exact logic depends on Laravel's output for 1 page

  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      {links.map((link, index) => {
        // Parse label for special characters (Laravel uses &laquo; and &raquo;)
        let label = link.label
        if (label.includes('&laquo;')) label = 'Previous'
        if (label.includes('&raquo;')) label = 'Next'

        // Render icons for Prev/Next
        let content: React.ReactNode = <span dangerouslySetInnerHTML={{ __html: link.label }} />
        if (label === 'Previous') content = <ChevronLeft className="h-4 w-4" />
        if (label === 'Next') content = <ChevronRight className="h-4 w-4" />

        return (
          <Button
            key={index}
            variant={link.active ? 'default' : 'outline'}
            size="icon"
            className={`h-8 w-8 ${link.active ? 'bg-primary text-primary-foreground' : ''} ${
              !link.url ? 'cursor-not-allowed opacity-50' : ''
            }`}
            disabled={!link.url}
            onClick={() => link.url && onPageChange(link.url)}
          >
            {content}
          </Button>
        )
      })}
    </div>
  )
}
