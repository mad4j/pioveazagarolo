/**
 * Pull-to-refresh module for touch devices
 * Handles downward pull gesture to trigger data refresh
 */

import { showToast } from './ui.js';

class PullToRefresh {
  constructor(options = {}) {
    this.onRefresh = options.onRefresh || (() => {});
    this.threshold = options.threshold || 80; // Minimum pull distance to trigger refresh
    this.maxPull = options.maxPull || 150; // Maximum pull distance for visual feedback
    this.resistance = options.resistance || 2.5; // Resistance factor for pull gesture
    
    this.isEnabled = true;
    this.isRefreshing = false;
    this.startY = 0;
    this.currentY = 0;
    this.pullDistance = 0;
    this.element = null;
    this.container = null;
    
    this.init();
  }
  
  init() {
    // Create pull-to-refresh container
    this.container = document.createElement('div');
    this.container.className = 'pull-to-refresh-container';
    this.container.innerHTML = `
      <div class="pull-to-refresh-arrow">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12l7-7 7 7"/>
        </svg>
      </div>
      <div class="pull-to-refresh-text">Tira per aggiornare</div>
      <div class="pull-to-refresh-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">Aggiornamento...</div>
      </div>
    `;
    
    document.body.insertBefore(this.container, document.body.firstChild);
    this.element = document.body;
    
    this.bindEvents();
  }
  
  bindEvents() {
    let touchStarted = false;
    
    // Touch events
    this.element.addEventListener('touchstart', (e) => {
      if (!this.isEnabled || this.isRefreshing) return;
      
      // Only handle if user is at the top of the page
      if (window.pageYOffset > 0) return;
      
      touchStarted = true;
      this.startY = e.touches[0].clientY;
      this.currentY = this.startY;
      this.container.classList.add('pulling');
    }, { passive: true });
    
    this.element.addEventListener('touchmove', (e) => {
      if (!touchStarted || !this.isEnabled || this.isRefreshing) return;
      
      this.currentY = e.touches[0].clientY;
      const deltaY = this.currentY - this.startY;
      
      // Only handle downward pulls
      if (deltaY > 0) {
        // Apply resistance to the pull
        this.pullDistance = Math.min(deltaY / this.resistance, this.maxPull);
        this.updateVisualFeedback();
        
        // Prevent default scrolling when pulling
        if (deltaY > 10) {
          e.preventDefault();
        }
      }
    }, { passive: false });
    
    this.element.addEventListener('touchend', () => {
      if (!touchStarted || !this.isEnabled || this.isRefreshing) return;
      
      touchStarted = false;
      
      if (this.pullDistance >= this.threshold) {
        this.triggerRefresh();
      } else {
        this.resetPull();
      }
    }, { passive: true });
    
    // Mouse events for testing on desktop
    this.addMouseEvents();
  }
  
  addMouseEvents() {
    let mouseDown = false;
    
    this.element.addEventListener('mousedown', (e) => {
      if (!this.isEnabled || this.isRefreshing || window.pageYOffset > 0) return;
      
      mouseDown = true;
      this.startY = e.clientY;
      this.currentY = this.startY;
      this.container.classList.add('pulling');
    });
    
    this.element.addEventListener('mousemove', (e) => {
      if (!mouseDown || !this.isEnabled || this.isRefreshing) return;
      
      this.currentY = e.clientY;
      const deltaY = this.currentY - this.startY;
      
      if (deltaY > 0) {
        this.pullDistance = Math.min(deltaY / this.resistance, this.maxPull);
        this.updateVisualFeedback();
        e.preventDefault();
      }
    });
    
    this.element.addEventListener('mouseup', () => {
      if (!mouseDown || !this.isEnabled || this.isRefreshing) return;
      
      mouseDown = false;
      
      if (this.pullDistance >= this.threshold) {
        this.triggerRefresh();
      } else {
        this.resetPull();
      }
    });
  }
  
  updateVisualFeedback() {
    const progress = Math.min(this.pullDistance / this.threshold, 1);
    const rotation = progress * 180; // Rotate arrow based on progress
    
    // Update container position and opacity
    this.container.style.transform = `translateY(${this.pullDistance - this.maxPull}px)`;
    this.container.style.opacity = Math.min(progress * 2, 1);
    
    // Update arrow rotation
    const arrow = this.container.querySelector('.pull-to-refresh-arrow svg');
    if (arrow) {
      arrow.style.transform = `rotate(${rotation}deg)`;
    }
    
    // Update text based on progress
    const textElement = this.container.querySelector('.pull-to-refresh-text');
    if (textElement) {
      if (progress >= 1) {
        textElement.textContent = 'Rilascia per aggiornare';
        this.container.classList.add('ready-to-refresh');
      } else {
        textElement.textContent = 'Tira per aggiornare';
        this.container.classList.remove('ready-to-refresh');
      }
    }
  }
  
  async triggerRefresh() {
    if (this.isRefreshing) return;
    
    this.isRefreshing = true;
    this.container.classList.add('refreshing');
    this.container.classList.remove('ready-to-refresh');
    
    // Show loading state
    this.container.style.transform = 'translateY(0)';
    this.container.style.opacity = '1';
    
    try {
      // Call the refresh function
      await this.onRefresh();
      
      // Show success feedback
      showToast('Dati aggiornati', 'success', 2000, true);
    } catch (error) {
      console.error('Error during pull-to-refresh:', error);
      showToast('Errore aggiornamento', 'error', 3000, true);
    } finally {
      // Reset after a short delay
      setTimeout(() => {
        this.resetPull();
        this.isRefreshing = false;
      }, 1000);
    }
  }
  
  resetPull() {
    this.pullDistance = 0;
    this.container.style.transform = `translateY(-${this.maxPull}px)`;
    this.container.style.opacity = '0';
    this.container.classList.remove('pulling', 'ready-to-refresh', 'refreshing');
    
    // Reset arrow rotation
    const arrow = this.container.querySelector('.pull-to-refresh-arrow svg');
    if (arrow) {
      arrow.style.transform = 'rotate(0deg)';
    }
    
    // Reset text
    const textElement = this.container.querySelector('.pull-to-refresh-text');
    if (textElement) {
      textElement.textContent = 'Tira per aggiornare';
    }
  }
  
  enable() {
    this.isEnabled = true;
  }
  
  disable() {
    this.isEnabled = false;
    this.resetPull();
  }
  
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

export { PullToRefresh };