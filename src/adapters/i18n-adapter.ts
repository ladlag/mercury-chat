/**
 * MateChat 国际化适配器
 * 
 * 目的：封装 MateChat 框架的国际化 API，实现业务代码与框架解耦
 * 优势：
 * 1. 业务代码不直接依赖 @matechat/core
 * 2. 框架升级时只需修改适配器
 * 3. 可以添加版本兼容处理
 * 4. 便于单元测试和 mock
 */

import McI18n from '@matechat/core/Locale';

export interface II18nAdapter {
    /**
     * 切换语言
     * @param lang 语言代码，如 'cn', 'en'
     */
    use(lang: string): void;
    
    /**
     * 获取当前语言
     * @returns 当前语言代码
     */
    getCurrentLanguage(): string;
}

/**
 * MateChat 国际化适配器实现
 */
class MateChatI18nAdapter implements II18nAdapter {
    /**
     * 记录当前使用的 MateChat 版本
     * 便于版本兼容性管理
     */
    private readonly mateChatVersion = '1.5.2';
    
    /**
     * 切换语言
     * 
     * @example
     * ```typescript
     * import { I18nAdapter } from '@/adapters/i18n-adapter';
     * I18nAdapter.use('cn');  // 切换到中文
     * I18nAdapter.use('en');  // 切换到英文
     * ```
     */
    use(lang: string): void {
        try {
            // MateChat v1.x API
            McI18n.use(lang);
            
            // 可以在这里添加版本兼容处理
            // if (this.hasNewAPI()) {
            //     McI18n.setLanguage(lang);  // v2.x 新 API
            // } else {
            //     McI18n.use(lang);  // v1.x 旧 API
            // }
        } catch (error) {
            console.error('[I18nAdapter] Failed to switch language:', error);
            // 降级处理：至少保存到 localStorage
            this.saveLanguageToStorage(lang);
        }
    }
    
    /**
     * 获取当前语言
     * 
     * @returns 当前语言代码
     * 
     * @example
     * ```typescript
     * const currentLang = I18nAdapter.getCurrentLanguage();
     * console.log(currentLang);  // 'cn' 或 'en'
     * ```
     */
    getCurrentLanguage(): string {
        // 优先从 localStorage 读取
        const storedLang = localStorage.getItem('matechat-lang');
        if (storedLang) {
            return storedLang;
        }
        
        // 默认返回中文
        return 'cn';
    }
    
    /**
     * 检测是否有新版本 API
     * 用于版本兼容性检查
     * 
     * @private
     */
    private hasNewAPI(): boolean {
        // 示例：检测 v2.x 的新 API
        return typeof (McI18n as any).setLanguage !== 'undefined';
    }
    
    /**
     * 保存语言到本地存储
     * 用于降级处理
     * 
     * @private
     */
    private saveLanguageToStorage(lang: string): void {
        try {
            localStorage.setItem('matechat-lang', lang);
        } catch (error) {
            console.error('[I18nAdapter] Failed to save language to storage:', error);
        }
    }
}

/**
 * 导出单例实例
 * 业务代码统一使用此实例
 */
export const I18nAdapter = new MateChatI18nAdapter();

/**
 * 使用示例：
 * 
 * 在业务代码中使用：
 * ```typescript
 * // src/store/lang-store.ts
 * import { I18nAdapter } from '@/adapters/i18n-adapter';
 * 
 * export const useLangStore = defineStore('lang', () => {
 *     const currentLang = ref(I18nAdapter.getCurrentLanguage());
 *     
 *     const updateCurrentLang = (val: string) => {
 *         currentLang.value = val;
 *         I18nAdapter.use(val);  // 通过适配器切换语言
 *         localStorage.setItem('matechat-lang', val);
 *     };
 *     
 *     return { currentLang, updateCurrentLang };
 * });
 * ```
 * 
 * 优势：
 * 1. 业务代码不需要 import '@matechat/core/Locale'
 * 2. 如果 MateChat 升级改变了 API，只需修改此适配器
 * 3. 便于测试：可以 mock I18nAdapter
 * 4. 清晰的依赖边界
 */
