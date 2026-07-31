<?php

namespace App\Application\Flow\Services;

/**
 * Shared flow logic: expression evaluation, variable resolution, and condition branching.
 */
trait SharedFlowLogic
{
    /** @return array<string, mixed> */
    abstract protected function sharedVariables(): array;

    protected function getVariable(string $path, mixed $default = ''): mixed
    {
        $parts = explode('.', $path);
        $current = $this->sharedVariables();

        foreach ($parts as $part) {
            if (! is_array($current) || ! array_key_exists($part, $current)) {
                return $default;
            }
            $current = $current[$part];
        }

        return $current;
    }

    protected function evaluateExpression(string $expression): bool
    {
        if (preg_match('/\{\{(.+?)\}\}/', $expression, $m)) {
            $expr = trim($m[1]);

            if (str_ends_with($expr, ' exists')) {
                $var = trim(substr($expr, 0, -7));

                return $this->getVariable($var, null) !== null;
            }

            if (preg_match('/^(\S+)\s*==\s*(.+)$/', $expr, $parts)) {
                $var = $this->getVariable($parts[1], '__UNDEFINED__');
                $val = trim($parts[2], '"\' ‘');

                return (string) $var === $val;
            }

            if (preg_match('/^(\S+)\s*!=\s*(.+)$/', $expr, $parts)) {
                $var = $this->getVariable($parts[1], '__UNDEFINED__');
                $val = trim($parts[2], '"\' ‘');

                return (string) $var !== $val;
            }

            if (preg_match('/^(\S+)\s*>=\s*(\d+)$/', $expr, $parts)) {
                return (float) $this->getVariable($parts[1], 0) >= (float) $parts[2];
            }

            if (preg_match('/^(\S+)\s*>\s*(\d+)$/', $expr, $parts)) {
                return (float) $this->getVariable($parts[1], 0) > (float) $parts[2];
            }

            if (preg_match('/^(\S+)\s*<=\s*(\d+)$/', $expr, $parts)) {
                return (float) $this->getVariable($parts[1], 0) <= (float) $parts[2];
            }

            if (preg_match('/^(\S+)\s*<\s*(\d+)$/', $expr, $parts)) {
                return (float) $this->getVariable($parts[1], 0) < (float) $parts[2];
            }

            if (preg_match('/^(\S+)\s+contains\s+(.+)$/', $expr, $parts)) {
                $var = (string) $this->getVariable($parts[1], '');
                $val = trim($parts[2], '"\' ‘');

                return $var !== '' && str_contains($var, $val);
            }

            if ($expr === 'true') {
                return true;
            }
            if ($expr === 'false') {
                return false;
            }

            $val = $this->getVariable($expr, null);

            return ! is_null($val) && $val !== '' && $val !== false;
        }

        return false;
    }

    /** @param array<string, mixed> $config */
    protected function evaluateCondition(array $config): ?string
    {
        $branches = $config['branches'] ?? [];
        $elseNext = $config['elseNext'] ?? null;

        foreach ($branches as $branch) {
            $expression = $branch['expression'] ?? '';
            if ($expression === '' || $this->evaluateExpression($expression)) {
                return $branch['next'] ?? $elseNext;
            }
        }

        return $elseNext;
    }

    protected function resolveVariables(mixed $value): mixed
    {
        if (is_string($value)) {
            return $this->resolveText($value);
        }

        if (is_array($value)) {
            return $this->resolveArray($value);
        }

        return $value;
    }

    protected function resolveText(string $text): string
    {
        return (string) preg_replace_callback(
            '/\{\{(\w+(?:\.\w+)*)\}\}/',
            fn ($m) => (string) $this->getVariable($m[1], $m[0]),
            $text,
        );
    }

    /** @param array<string, mixed> $arr
     *  @return array<string, mixed> */
    protected function resolveArray(array $arr): array
    {
        $resolved = [];
        foreach ($arr as $key => $val) {
            $resolved[$key] = $this->resolveVariables($val);
        }

        return $resolved;
    }
}
