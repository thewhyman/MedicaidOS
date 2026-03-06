import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
    it('renders with default text', () => {
        render(<Button>Click me</Button>)
        expect(screen.getByText('Click me')).toBeDefined()
    })

    it('triggers onClick when clicked', () => {
        const handleClick = vi.fn()
        render(<Button onClick={handleClick}>Click me</Button>)
        fireEvent.click(screen.getByText('Click me'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('is disabled when the disabled prop is passed', () => {
        render(<Button disabled>Disabled Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveProperty('disabled', true)
    })

    it('applies the correct variant class', () => {
        render(<Button variant="destructive">Destructive</Button>)
        const button = screen.getByRole('button')
        expect(button.className).toContain('bg-destructive')
    })
})
