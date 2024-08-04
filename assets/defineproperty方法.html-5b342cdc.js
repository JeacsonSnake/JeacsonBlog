import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,e}from"./app-14bfa3d8.js";const t={},p=e(`<h2 id="简述" tabindex="-1"><a class="header-anchor" href="#简述" aria-hidden="true">#</a> 简述</h2><p>Object.defineProperty 是 JavaScript 中 Object 类下的一个高级函数, 它可以用其内置的 <em>getter</em> 与 <em>setter</em> 对传入的数据进行修改操作。一般用于旧时各种JS框架作响应式数据用。由于该方法本质较为臃肿且已经有相应方法做替代，现在大部分框架已经采用 ES6 中的 Proxy/Reflect 新方法作为优先选择。</p><h2 id="简单样例" tabindex="-1"><a class="header-anchor" href="#简单样例" aria-hidden="true">#</a> 简单样例</h2><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>        <span class="token keyword">let</span> number <span class="token operator">=</span> <span class="token number">18</span><span class="token punctuation">;</span>
        <span class="token keyword">let</span> person <span class="token operator">=</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;Jeasfds&#39;</span><span class="token punctuation">,</span>
            <span class="token literal-property property">sex</span><span class="token operator">:</span> <span class="token string">&#39; male&#39;</span>
        <span class="token punctuation">}</span>

        Object<span class="token punctuation">.</span><span class="token function">defineProperty</span><span class="token punctuation">(</span>person<span class="token punctuation">,</span> <span class="token string">&#39;ages&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
            <span class="token comment">// value: 18,</span>
            <span class="token literal-property property">enumerable</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span><span class="token comment">//控制属性是否可以枚举（默认为false）</span>
            <span class="token literal-property property">writable</span><span class="token operator">:</span><span class="token boolean">true</span><span class="token punctuation">,</span><span class="token comment">//控制属性是否可以被修改（默认为false）</span>
            <span class="token literal-property property">configurable</span><span class="token operator">:</span><span class="token boolean">true</span><span class="token punctuation">,</span><span class="token comment">//控制属性是否可以被删除（默认为false）</span>


            <span class="token comment">//当有人读取 &#39;person&#39; 的 &#39;age&#39; 属性值时，get 函数（getter）会被调用， 且返回值为age值</span>
            <span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">return</span> number<span class="token punctuation">;</span>
            <span class="token punctuation">}</span><span class="token punctuation">,</span>
            <span class="token comment">//当有人修改 &#39;person&#39; 的 &#39;age&#39; 属性值时，set 函数（setter）会被调用， 且会收到修改的具体值</span>
            <span class="token function">set</span><span class="token punctuation">(</span>value<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                number <span class="token operator">=</span> value<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span><span class="token punctuation">)</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,4),o=[p];function c(l,i){return s(),a("div",null,o)}const d=n(t,[["render",c],["__file","defineproperty方法.html.vue"]]);export{d as default};
