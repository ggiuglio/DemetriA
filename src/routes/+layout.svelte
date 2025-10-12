<script>
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import '$lib/styles.css';

    const menuItems = [
        { label: 'Today', href: '/' },
        { label: 'My Fields', href: '/fields' },
        { label: 'My Crops', href: '/crops' },
        { label: 'Calendar', href: '/calendar' },
        { label: 'DemetriA IQ', href: '/iq' }
    ];
</script>

<div class="flex h-screen flex-col bg-[#faf9f6]">
    <!-- Top Bar -->
    <header class="bg-[#e8f5e9] border-b-2 border-[#333] relative">
        <div class="px-6 py-4">
            <h1 class="text-4xl font-bold pencil-text text-[#2e7d32] sketch-underline">DemetriA</h1>
        </div>
        <!-- Sketch effect -->
        <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#333] opacity-30" style="border-radius: 50%;"></div>
    </header>

    <div class="flex flex-1 overflow-hidden">
        <!-- Left Sidebar -->
        <aside class="w-64 bg-[#fff8e1] border-r-2 border-[#333] overflow-y-auto relative">
            <nav class="p-4">
                <ul class="space-y-3">
                    {#each menuItems as item}
                        <li>
                            <a
                                href={item.href}
                                class="flex items-center justify-start px-4 py-3 sketch-button transition-all {$page.url.pathname === item.href ? 'bg-[#a5d6a7] text-[#1b5e20] font-bold' : 'bg-white text-[#333] hover:bg-[#f1f8e9]'}"
                            >
                                <span class="text-lg whitespace-nowrap">{item.label}</span>
                            </a>
                        </li>
                    {/each}
                </ul>
            </nav>
            <!-- Vertical sketch line -->
            <div class="absolute top-0 right-0 w-0.5 h-full bg-[#333] opacity-20"></div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto bg-[#faf9f6] relative">
            <div class="p-8">
                <slot />
            </div>
        </main>
    </div>
</div>
