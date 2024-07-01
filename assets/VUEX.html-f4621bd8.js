import{_ as p}from"./plugin-vue_export-helper-c27b6911.js";import{r as o,o as c,c as i,a as n,b as s,d as t,e}from"./app-f7c48904.js";const l="/assets/vuexCycle-8c0e4ddf.jpg",u={},r=n("h2",{id:"简述",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#简述","aria-hidden":"true"},"#"),s(" 简述")],-1),d=n("p",null,"这里是当时学习vuex时产出的相关笔记。目前已从图片版本整理为可供阅览的电子格式。",-1),k={href:"https://v3.vuex.vuejs.org/zh/guide/",target:"_blank",rel:"noopener noreferrer"},v=e('<h2 id="vuex循环图" tabindex="-1"><a class="header-anchor" href="#vuex循环图" aria-hidden="true">#</a> VUEX循环图</h2><p><img src="'+l+`" alt="vuex-cycle"></p><h2 id="一、vuex介绍" tabindex="-1"><a class="header-anchor" href="#一、vuex介绍" aria-hidden="true">#</a> 一、VUEX介绍</h2><p>VueX是专门在vue中实现集中式状态(数据)管理的vue插件。它可以对vue应用中多个组件的共享状态进行集中式的管理(例如读与写)。 它同样可以是一种组件间通信的方式，且适用于任意的组件间通信。</p><h2 id="二、创建与使用" tabindex="-1"><a class="header-anchor" href="#二、创建与使用" aria-hidden="true">#</a> 二、创建与使用</h2><div class="hint-container tip"><p class="hint-container-title">提示</p><p>为了能够更方便的进行管理，这里强烈建议将各种配置分为多个文件使用，而不是将所有配置全部写入<code>main.js</code>。</p></div><div class="hint-container info"><p class="hint-container-title">相关信息</p><p>假设使用vue-cli等构建工具实现了vue框架的创建，则会存在src文件夹。</p></div><p>在src文件夹下创建store文件夹以存储相关配置信息，并在其中创建入口文件index.js:</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>    <span class="token comment">// index.js</span>
    <span class="token comment">// 引入 vue 与 vuex</span>
    <span class="token keyword">import</span> Vue <span class="token keyword">from</span> <span class="token string">&#39;Vue&#39;</span>
    <span class="token keyword">import</span> Vuex <span class="token keyword">from</span> <span class="token string">&#39;Vuex&#39;</span>

    <span class="token comment">// 依照使用插件的方式引入vuex</span>
    Vue<span class="token punctuation">.</span><span class="token function">use</span><span class="token punctuation">(</span>Vuex<span class="token punctuation">)</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>之后就可以使用Vuex.store内的属性对其进行定义了。通常被使用的最多的四个属性为<code>actions</code>, <code>mutations</code>, <code>state</code>, <code>getters</code>。</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>    <span class="token comment">// index.js</span>
    <span class="token operator">...</span>
    <span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">new</span> <span class="token class-name">Vuex<span class="token punctuation">.</span>store</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
        <span class="token literal-property property">actions</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token operator">...</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token literal-property property">mutations</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token operator">...</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token literal-property property">state</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token operator">...</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token literal-property property">getters</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token operator">...</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当然你也可以将这四个属性单独进行配置后，再将其引入:</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>    <span class="token comment">// index.js</span>
    <span class="token operator">...</span>
    <span class="token keyword">const</span> actions <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token operator">...</span><span class="token punctuation">}</span>

    <span class="token keyword">const</span> mutations <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token operator">...</span><span class="token punctuation">}</span>

    <span class="token keyword">const</span> state <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token operator">...</span><span class="token punctuation">}</span>

    <span class="token keyword">const</span> getters <span class="token operator">=</span> <span class="token punctuation">{</span><span class="token operator">...</span><span class="token punctuation">}</span>

    <span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token keyword">new</span> <span class="token class-name">Vuex<span class="token punctuation">.</span>store</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
        actions<span class="token punctuation">,</span>
        mutations<span class="token punctuation">,</span>
        state<span class="token punctuation">,</span>
        getters
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以下将从state开始针对这四个属性进行简单解释：</p><h3 id="_2-1-state" tabindex="-1"><a class="header-anchor" href="#_2-1-state" aria-hidden="true">#</a> 2.1 state</h3><p>用于存储整个vue程序内各个组件可以共享的数据。一般里面的数据会进行如下定义：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>    <span class="token comment">// index.js</span>
    <span class="token operator">...</span>
    <span class="token keyword">const</span> state <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">data1</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
        <span class="token literal-property property">data2</span><span class="token operator">:</span> <span class="token number">2</span><span class="token punctuation">,</span>
        <span class="token literal-property property">data3</span><span class="token operator">:</span> <span class="token number">3</span><span class="token punctuation">,</span>
        <span class="token operator">...</span>
    <span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以使用 <code>$store.state</code> 对其内部的参数进行读取。具体例子如下:</p><div class="language-vue line-numbers-mode" data-ext="vue"><pre class="language-vue"><code>    // in vue component
    ...
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span><span class="token punctuation">&gt;</span></span><span class="token script"><span class="token language-javascript">
    <span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>

        <span class="token operator">...</span>
        <span class="token literal-property property">computed</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token function">data1</span><span class="token punctuation">(</span><span class="token parameter">value</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">this</span><span class="token punctuation">.</span>$store<span class="token punctuation">.</span>state<span class="token punctuation">.</span>data1
            <span class="token punctuation">}</span>
            <span class="token operator">...</span>
        <span class="token punctuation">}</span>

    <span class="token punctuation">}</span>
    </span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-2-getters" tabindex="-1"><a class="header-anchor" href="#_2-2-getters" aria-hidden="true">#</a> 2.2 getters</h3><p>可以被认为是另一种计算属性，但是在该属性中所传入的参数为state：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>    <span class="token comment">// index.js</span>
    <span class="token operator">...</span>
    <span class="token keyword">const</span> getters <span class="token operator">=</span> <span class="token punctuation">{</span>
        
        <span class="token function">data1Times10</span><span class="token punctuation">(</span><span class="token parameter">state</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> state<span class="token punctuation">.</span>data1 <span class="token operator">*</span> <span class="token number">10</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token function">data2MinusData3</span><span class="token punctuation">(</span><span class="token parameter">state</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> state<span class="token punctuation">.</span>data2 <span class="token operator">-</span> state<span class="token punctuation">.</span>data3
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token operator">...</span>
    <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以使用 <code>$store.getters</code> 对其内部的参数进行读取。具体例子如下:</p><div class="language-vue line-numbers-mode" data-ext="vue"><pre class="language-vue"><code>    // in vue component
    ...
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span><span class="token punctuation">&gt;</span></span><span class="token script"><span class="token language-javascript">
    <span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>

        <span class="token operator">...</span>
        <span class="token literal-property property">computed</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token function">increaseData1</span><span class="token punctuation">(</span><span class="token parameter">value</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">this</span><span class="token punctuation">.</span>$store<span class="token punctuation">.</span>getters<span class="token punctuation">.</span>data1Times10
            <span class="token punctuation">}</span>
            <span class="token operator">...</span>
        <span class="token punctuation">}</span>

    <span class="token punctuation">}</span>
    </span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-3-mutations" tabindex="-1"><a class="header-anchor" href="#_2-3-mutations" aria-hidden="true">#</a> 2.3 mutations</h3><p>更改 Vuex 的 store 中的数据的唯一方法是使用 mutation 中的函数对其进行提交：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>    <span class="token comment">// index.js</span>
    <span class="token operator">...</span>
    <span class="token keyword">const</span> mutations <span class="token operator">=</span> <span class="token punctuation">{</span>
        
        <span class="token function">increaseData1ByValue</span><span class="token punctuation">(</span><span class="token parameter">state<span class="token punctuation">,</span> value</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> state<span class="token punctuation">.</span>data1 <span class="token operator">+</span> value
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token function">decreaseData1ByValue</span><span class="token punctuation">(</span><span class="token parameter">state<span class="token punctuation">,</span> value</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">return</span> state<span class="token punctuation">.</span>data1 <span class="token operator">-</span> value
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token operator">...</span>
    <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当希望调用内部的方法进行数据提交时，需要调用 <code>$store.commit</code> 进行提交。具体例子如下:</p><div class="language-vue line-numbers-mode" data-ext="vue"><pre class="language-vue"><code>    // in vue component
    ...
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span><span class="token punctuation">&gt;</span></span><span class="token script"><span class="token language-javascript">
    <span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>

        <span class="token operator">...</span>
        <span class="token literal-property property">methods</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token comment">// ①直接将值进行传输</span>
            <span class="token function">increaseData1</span><span class="token punctuation">(</span><span class="token parameter">value</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">this</span><span class="token punctuation">.</span>$store<span class="token punctuation">.</span><span class="token function">commit</span><span class="token punctuation">(</span><span class="token string">&#39;increaseData1ByValue&#39;</span><span class="token punctuation">,</span> value<span class="token punctuation">)</span>
            <span class="token punctuation">}</span><span class="token punctuation">,</span>
            <span class="token comment">// ②将值包裹进对象中，以载荷方式进行传输</span>
            <span class="token function">decreaseData1</span><span class="token punctuation">(</span><span class="token parameter">value</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">this</span><span class="token punctuation">.</span>$store<span class="token punctuation">.</span><span class="token function">commit</span><span class="token punctuation">(</span><span class="token string">&#39;decreaseData1ByValue&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
                    value
                <span class="token punctuation">}</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span><span class="token punctuation">,</span>
            <span class="token comment">// ③以对象方式进行传输</span>
            <span class="token function">decreaseData1</span><span class="token punctuation">(</span><span class="token parameter">value</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">this</span><span class="token punctuation">.</span>$store<span class="token punctuation">.</span><span class="token function">commit</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
                    <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;decreaseData1ByValue&#39;</span>
                    value
                <span class="token punctuation">}</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span>

            <span class="token operator">...</span>
        <span class="token punctuation">}</span>

    <span class="token punctuation">}</span>
    </span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-4-actions" tabindex="-1"><a class="header-anchor" href="#_2-4-actions" aria-hidden="true">#</a> 2.4 actions</h3><p>用于提交数据，<strong>但是 action 提交数据时使用 mutation 作为中介，而不是直接变更状态。</strong> 因此该属性一般用于包含任意异步操作。 Action 函数接受一个与 store 实例具有相同方法和属性的 context 对象，因此你可以调用 context.commit 提交一个 mutation，或者通过 context.state 和 context.getters 来获取 state 和 getters。</p><div class="hint-container tip"><p class="hint-container-title">提示</p><pre><code>因为模块分割的原因，这里的context和store有一些地方不一致，即\`context !== store\`。具体可以参考[官方文档 Vuex 3.x Module](https://v3.vuex.vuejs.org/zh/guide/modules.html)。
</code></pre></div><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>    <span class="token comment">// index.js</span>
    <span class="token comment">// 在这里就可以使用之前所说的三种方法进行传输</span>
    <span class="token operator">...</span>
    <span class="token keyword">const</span> actions <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token function">incrementData1Async1</span><span class="token punctuation">(</span><span class="token parameter">context<span class="token punctuation">,</span> value</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">setTimeout</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
                context<span class="token punctuation">.</span><span class="token function">commit</span><span class="token punctuation">(</span><span class="token string">&#39;increaseData1ByValue&#39;</span><span class="token punctuation">,</span> value<span class="token punctuation">)</span>
            <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token comment">// ②将值包裹进对象中，以载荷方式进行传输</span>
        <span class="token function">decreaseData1Async2</span><span class="token punctuation">(</span><span class="token parameter">context<span class="token punctuation">,</span> value</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            context<span class="token punctuation">.</span><span class="token function">commit</span><span class="token punctuation">(</span><span class="token string">&#39;decreaseData1ByValue&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
                value
            <span class="token punctuation">}</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token comment">// ③以对象方式进行传输</span>
        <span class="token function">decreaseData1Async3</span><span class="token punctuation">(</span><span class="token parameter">context<span class="token punctuation">,</span> value</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            context<span class="token punctuation">.</span><span class="token function">commit</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
                <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;decreaseData1ByValue&#39;</span>
                value
            <span class="token punctuation">}</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
        <span class="token operator">...</span>
    <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当然如果在需要引用多次commit等情况下可能会出现多次使用context的麻烦情况，因此实践中，我们会经常用到 ES2015 的 <strong>参数解构</strong>，就是 <strong>直接将对象中需要用到的的属性传入，而不将整个对象直接传入</strong> 的方法来简化代码:</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>    <span class="token comment">// index.js</span>
    <span class="token operator">...</span>
    <span class="token keyword">const</span> actions <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token function">incrementData1Async</span> <span class="token punctuation">(</span><span class="token parameter"><span class="token punctuation">{</span> commit <span class="token punctuation">}</span></span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">setTimeout</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
                <span class="token function">commit</span><span class="token punctuation">(</span><span class="token string">&#39;increaseData1&#39;</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
        <span class="token operator">...</span>
    <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当希望调用内部的方法进行数据提交时，需要调用 <code>$store.dispatch</code> 进行提交。具体例子如下:</p><div class="language-vue line-numbers-mode" data-ext="vue"><pre class="language-vue"><code>    // in vue component
    ...
    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>script</span><span class="token punctuation">&gt;</span></span><span class="token script"><span class="token language-javascript">
    <span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>

        <span class="token operator">...</span>
        <span class="token literal-property property">methods</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token comment">// ①直接将值进行传输</span>
            <span class="token function">increaseData1</span><span class="token punctuation">(</span><span class="token parameter">value</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">this</span><span class="token punctuation">.</span>$store<span class="token punctuation">.</span><span class="token function">dispatch</span><span class="token punctuation">(</span><span class="token string">&#39;incrementData1Async1&#39;</span><span class="token punctuation">,</span> value<span class="token punctuation">)</span>
            <span class="token punctuation">}</span><span class="token punctuation">,</span>
            <span class="token comment">// ②将值包裹进对象中进行传输</span>
            <span class="token function">decreaseData1</span><span class="token punctuation">(</span><span class="token parameter">value</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">this</span><span class="token punctuation">.</span>$store<span class="token punctuation">.</span><span class="token function">dispatch</span><span class="token punctuation">(</span><span class="token string">&#39;decreaseData1Async2&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
                    value
                <span class="token punctuation">}</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span><span class="token punctuation">,</span>
            <span class="token comment">// ③以对象方式进行传输</span>
            <span class="token function">decreaseData2</span><span class="token punctuation">(</span><span class="token parameter">value</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">this</span><span class="token punctuation">.</span>$store<span class="token punctuation">.</span><span class="token function">dispatch</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
                    <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;decreaseData1Async3&#39;</span>
                    value
                <span class="token punctuation">}</span><span class="token punctuation">)</span>
            <span class="token punctuation">}</span>

            <span class="token operator">...</span>
        <span class="token punctuation">}</span>

    <span class="token punctuation">}</span>
    </span></span><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>script</span><span class="token punctuation">&gt;</span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-5-map-辅助函数" tabindex="-1"><a class="header-anchor" href="#_2-5-map-辅助函数" aria-hidden="true">#</a> 2.5 map 辅助函数</h3><p>Vuex提供了多个map辅助函数，使得我们可以用较少的代码量同时引入多个属性。</p><h4 id="_2-5-1-mapstate-辅助函数" tabindex="-1"><a class="header-anchor" href="#_2-5-1-mapstate-辅助函数" aria-hidden="true">#</a> 2.5.1 mapState 辅助函数</h4><p>当一个组件需要获取多个状态的时候，将这些状态都声明为计算属性会有些重复和冗余。为了解决这个问题，我们可以使用 <code>mapState</code> 辅助函数帮助我们生成计算属性:</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// 在单独构建的版本中辅助函数为 Vuex.mapState</span>
<span class="token keyword">import</span> <span class="token punctuation">{</span> mapState <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;vuex&#39;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>
  <span class="token comment">// ...</span>
  <span class="token literal-property property">computed</span><span class="token operator">:</span> <span class="token function">mapState</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token comment">// 箭头函数可使代码更简练</span>
    <span class="token function-variable function">count</span><span class="token operator">:</span> <span class="token parameter">state</span> <span class="token operator">=&gt;</span> state<span class="token punctuation">.</span>count<span class="token punctuation">,</span>

    <span class="token comment">// 传字符串参数 &#39;count&#39; 等同于 \`state =&gt; state.count\`</span>
    <span class="token literal-property property">countAlias</span><span class="token operator">:</span> <span class="token string">&#39;count&#39;</span><span class="token punctuation">,</span>

    <span class="token comment">// 为了能够使用 \`this\` 获取局部状态，必须使用常规函数</span>
    <span class="token function">countPlusLocalState</span> <span class="token punctuation">(</span><span class="token parameter">state</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
      <span class="token keyword">return</span> state<span class="token punctuation">.</span>count <span class="token operator">+</span> <span class="token keyword">this</span><span class="token punctuation">.</span>localCount
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当映射的计算属性的名称与 state 的子节点名称相同时，我们也可以给 mapState 传一个字符串数组。</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>
<span class="token literal-property property">computed</span><span class="token operator">:</span> <span class="token function">mapState</span><span class="token punctuation">(</span><span class="token punctuation">[</span>
  <span class="token comment">// 映射 this.count 为 store.state.count</span>
  <span class="token string">&#39;count&#39;</span>
<span class="token punctuation">]</span><span class="token punctuation">)</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果组件原本就有自己的计算属性，需要与store内的属性进行混合使用的话，可以使用对象展开运算符将 mapState 混入 computed 对象中：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token literal-property property">computed</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token comment">// 原有的计算属性</span>
    <span class="token function">localComputedA</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">/* ... */</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token function">localComputedB</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">/* ... */</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    
    <span class="token comment">// 使用对象展开运算符将此对象混入到外部对象中</span>
    <span class="token operator">...</span><span class="token function">mapState</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token comment">// ...</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-5-2-mapgetters-辅助函数" tabindex="-1"><a class="header-anchor" href="#_2-5-2-mapgetters-辅助函数" aria-hidden="true">#</a> 2.5.2 mapGetters 辅助函数</h4><p><code>mapGetters</code> 辅助函数仅仅是将 store 中的 getter 映射到局部计算属性：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">import</span> <span class="token punctuation">{</span> mapGetters <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;vuex&#39;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>
  <span class="token comment">// ...</span>
  <span class="token literal-property property">computed</span><span class="token operator">:</span> <span class="token punctuation">{</span>
  <span class="token comment">// 使用对象展开运算符将 getter 混入 computed 对象中</span>
    <span class="token operator">...</span><span class="token function">mapGetters</span><span class="token punctuation">(</span><span class="token punctuation">[</span>
      <span class="token string">&#39;doneTodosCount&#39;</span><span class="token punctuation">,</span>
      <span class="token string">&#39;anotherGetter&#39;</span><span class="token punctuation">,</span>
      <span class="token comment">// ...</span>
    <span class="token punctuation">]</span><span class="token punctuation">)</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果你想将一个 getter 属性另取一个名字，则可以使用对象形式：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token operator">...</span><span class="token function">mapGetters</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
  <span class="token comment">// 把 \`this.doneCount\` 映射为 \`this.$store.getters.doneTodosCount\`</span>
  <span class="token literal-property property">doneCount</span><span class="token operator">:</span> <span class="token string">&#39;doneTodosCount&#39;</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-5-3-mapmutations-辅助函数" tabindex="-1"><a class="header-anchor" href="#_2-5-3-mapmutations-辅助函数" aria-hidden="true">#</a> 2.5.3 mapMutations 辅助函数</h4><p>你可以在组件中使用 <code>this.$store.commit(&#39;xxx&#39;)</code> 提交 mutation，或者使用 <code>mapMutations</code> 辅助函数将组件中的 methods 映射为 <code>store.commit</code> 调用（需要在根节点注入 store）。</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">import</span> <span class="token punctuation">{</span> mapMutations <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;vuex&#39;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>
  <span class="token comment">// ...</span>
  <span class="token literal-property property">methods</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token operator">...</span><span class="token function">mapMutations</span><span class="token punctuation">(</span><span class="token punctuation">[</span>
      <span class="token string">&#39;increment&#39;</span><span class="token punctuation">,</span> <span class="token comment">// 将 \`this.increment()\` 映射为 \`this.$store.commit(&#39;increment&#39;)\`</span>

      <span class="token comment">// \`mapMutations\` 也支持载荷：</span>
      <span class="token string">&#39;incrementBy&#39;</span> <span class="token comment">// 将 \`this.incrementBy(amount)\` 映射为 \`this.$store.commit(&#39;incrementBy&#39;, amount)\`</span>
    <span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token operator">...</span><span class="token function">mapMutations</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
      <span class="token literal-property property">add</span><span class="token operator">:</span> <span class="token string">&#39;increment&#39;</span> <span class="token comment">// 将 \`this.add()\` 映射为 \`this.$store.commit(&#39;increment&#39;)\`</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-5-4-mapactions-辅助函数" tabindex="-1"><a class="header-anchor" href="#_2-5-4-mapactions-辅助函数" aria-hidden="true">#</a> 2.5.4 mapActions 辅助函数</h4><p>你可以在组件中使用 <code>this.$store.dispatch(&#39;xxx&#39;)</code> 分发 action，或者使用 <code>mapActions</code> 辅助函数将组件的 methods 映射为 <code>store.dispatch</code> 调用（同样需要先在根节点注入 store）：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">import</span> <span class="token punctuation">{</span> mapActions <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;vuex&#39;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>
  <span class="token comment">// ...</span>
  <span class="token literal-property property">methods</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token operator">...</span><span class="token function">mapActions</span><span class="token punctuation">(</span><span class="token punctuation">[</span>
      <span class="token string">&#39;increment&#39;</span><span class="token punctuation">,</span> <span class="token comment">// 将 \`this.increment()\` 映射为 \`this.$store.dispatch(&#39;increment&#39;)\`</span>

      <span class="token comment">// \`mapActions\` 也支持载荷：</span>
      <span class="token string">&#39;incrementBy&#39;</span> <span class="token comment">// 将 \`this.incrementBy(amount)\` 映射为 \`this.$store.dispatch(&#39;incrementBy&#39;, amount)\`</span>
    <span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token operator">...</span><span class="token function">mapActions</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
      <span class="token literal-property property">add</span><span class="token operator">:</span> <span class="token string">&#39;increment&#39;</span> <span class="token comment">// 将 \`this.add()\` 映射为 \`this.$store.dispatch(&#39;increment&#39;)\`</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-模块化" tabindex="-1"><a class="header-anchor" href="#_3-模块化" aria-hidden="true">#</a> 3.模块化</h3>`,58),m={href:"https://v3.vuex.vuejs.org/zh/guide/state.html#%E5%8D%95%E4%B8%80%E7%8A%B6%E6%80%81%E6%A0%91",target:"_blank",rel:"noopener noreferrer"},b=e(`<p>为了解决以上问题，Vuex 允许我们将 store 分割成多个模块（module）。每个模块拥有各自的 state、mutation、action、getter、甚至是另外几个嵌套的子模块——从上至下进行同样方式的分割：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>    <span class="token keyword">const</span> moduleA <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token function-variable function">state</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token literal-property property">mutations</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token literal-property property">actions</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token literal-property property">getters</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">const</span> moduleB <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token function-variable function">state</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token literal-property property">mutations</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token literal-property property">actions</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">const</span> store <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Vuex<span class="token punctuation">.</span>Store</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
        <span class="token literal-property property">modules</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">a</span><span class="token operator">:</span> moduleA<span class="token punctuation">,</span>
            <span class="token literal-property property">b</span><span class="token operator">:</span> moduleB
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>

    store<span class="token punctuation">.</span>state<span class="token punctuation">.</span>a <span class="token comment">// -&gt; moduleA 的状态</span>
    store<span class="token punctuation">.</span>state<span class="token punctuation">.</span>b <span class="token comment">// -&gt; moduleB 的状态</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container tip"><p class="hint-container-title">提示</p><p>默认情况下，模块内部的 action、mutation 和 getter 是注册在全局命名空间的——这样使得多个模块能够对同一 mutation 或 action 作出响应。如果希望你的模块具有更高的封装度和复用性，你可以通过添加 <code>namespaced: true</code> 的方式使其成为带命名空间的模块:</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>    <span class="token keyword">const</span> moduleC <span class="token operator">=</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">namespaced</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
        <span class="token function-variable function">state</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token literal-property property">mutations</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token literal-property property">actions</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token literal-property property">getters</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">const</span> store <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Vuex<span class="token punctuation">.</span>Store</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
        <span class="token literal-property property">modules</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">c</span><span class="token operator">:</span> moduleC
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span>

    store<span class="token punctuation">.</span>state<span class="token punctuation">.</span>a <span class="token comment">// -&gt; moduleA 的状态</span>
    store<span class="token punctuation">.</span>state<span class="token punctuation">.</span>b <span class="token comment">// -&gt; moduleB 的状态</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当模块被注册后，它的所有 getter、action 及 mutation 都会自动根据模块注册的路径调整命名，一般格式为<code>&#39;模块名/原有名&#39;</code>。例如：</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">const</span> store <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Vuex<span class="token punctuation">.</span>Store</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
  <span class="token literal-property property">modules</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token literal-property property">account</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token literal-property property">namespaced</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>

      <span class="token comment">// 模块内容（module assets）</span>
      <span class="token function-variable function">state</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token comment">// 模块内的状态已是嵌套的，使用 \`namespaced\` 属性不会对其产生影响</span>
      <span class="token literal-property property">getters</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token function">isAdmin</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span> <span class="token comment">// -&gt; getters[&#39;account/isAdmin&#39;]</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token literal-property property">actions</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token function">login</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span> <span class="token comment">// -&gt; dispatch(&#39;account/login&#39;)</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token literal-property property">mutations</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token function">login</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span> <span class="token comment">// -&gt; commit(&#39;account/login&#39;)</span>
      <span class="token punctuation">}</span><span class="token punctuation">,</span>

      <span class="token comment">// 嵌套模块</span>
      <span class="token literal-property property">modules</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token comment">// 继承父模块的命名空间</span>
        <span class="token literal-property property">myPage</span><span class="token operator">:</span> <span class="token punctuation">{</span>
          <span class="token function-variable function">state</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
          <span class="token literal-property property">getters</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token function">profile</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span> <span class="token comment">// -&gt; getters[&#39;account/profile&#39;]</span>
          <span class="token punctuation">}</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>

        <span class="token comment">// 进一步嵌套命名空间</span>
        <span class="token literal-property property">posts</span><span class="token operator">:</span> <span class="token punctuation">{</span>
          <span class="token literal-property property">namespaced</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>

          <span class="token function-variable function">state</span><span class="token operator">:</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
          <span class="token literal-property property">getters</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token function">popular</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token operator">...</span> <span class="token punctuation">}</span> <span class="token comment">// -&gt; getters[&#39;account/posts/popular&#39;]</span>
          <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div>`,3);function g(y,h){const a=o("ExternalLinkIcon");return c(),i("div",null,[r,d,n("p",null,[s("参考官方文档: "),n("a",k,[s("click"),t(a)])]),v,n("p",null,[s("由于vuex使用"),n("a",m,[s("单一状态树"),t(a)]),s("，使得应用的所有状态会被集中到一个比较大的对象中，因此当应用变得非常复杂时，store 对象就有可能因为数据的大量增长而变得相当臃肿。")]),b])}const j=p(u,[["render",g],["__file","VUEX.html.vue"]]);export{j as default};
