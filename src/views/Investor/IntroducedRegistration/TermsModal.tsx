import React, { useState, useEffect, useRef } from 'react';

interface TermsModalProps {
  show: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ show, onClose, onAccept }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      setHasScrolledToBottom(false);
      // Reset scroll position when modal is opened
      if (bodyRef.current) {
        bodyRef.current.scrollTop = 0;
      }

      // Check if the content is short enough that it doesn't need scrolling to enable button
      const timer = setTimeout(() => {
        if (bodyRef.current) {
          const { scrollHeight, clientHeight } = bodyRef.current;
          if (scrollHeight <= clientHeight + 10) {
            setHasScrolledToBottom(true);
          }
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // Calculate if scrolled near bottom (within 15px threshold to account for rounding errors)
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 15;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  if (!show) return null;

  return (
    <div id="termsModal" className={`modal ${show ? 'show' : ''} terms-modal`}>
      <div className="modal-content">
        {/* Fixed Header */}
        <div className="modal-header">
          <h2>Terms and Conditions</h2>
          <button className="close-btn" onClick={onClose} type="button" aria-label="Close">&times;</button>
        </div>

        {/* Scrollable Body */}
        <div className="modal-body" ref={bodyRef} onScroll={handleScroll}>
          <div className="privacy-policy-text terms-use-text">
            <h3>1. Acceptance of Terms</h3>
            <p>By accessing and using the Facilon platform ("Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this Platform.</p>

            <h3>2. Use License</h3>
            <p>Permission is granted to temporarily access the materials (information or software) on Facilon's Platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul className="alpha-list" style={{ marginBottom: '10px' }}>
              <li>modify or copy the materials;</li>
              <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>attempt to decompile or reverse engineer any software contained on Facilon's Platform;</li>
              <li>remove any copyright or other proprietary notations from the materials; or</li>
              <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>

            <h3>3. Disclaimer</h3>
            <p>The materials on Facilon's Platform are provided on an 'as is' basis. Facilon makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            <p>Further, Facilon does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its Platform or otherwise relating to such materials or on any sites linked to this Platform.</p>

            <h3>4. Limitations</h3>
            <p>In no event shall Facilon or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Facilon's Platform, even if Facilon or a Facilon authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.</p>

            <h3>5. Accuracy of Materials</h3>
            <p>The materials appearing on Facilon's Platform could include technical, typographical, or photographic errors. Facilon does not warrant that any of the materials on its Platform are accurate, complete or current. Facilon may make changes to the materials contained on its Platform at any time without notice. However Facilon does not make any commitment to update the materials.</p>

            <h3>6. Links</h3>
            <p>Facilon has not reviewed all of the sites linked to its Platform and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Facilon of the site. Use of any such linked website is at the user's own risk.</p>

            <h3>7. Modifications</h3>
            <p>Facilon may revise these terms of service for its Platform at any time without notice. By using this Platform you are agreeing to be bound by the then current version of these terms of service.</p>

            <h3>8. Governing Law</h3>
            <p>These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>

            <h3>9. Intellectual Property</h3>
            <p>All intellectual property, including in relation to the Platforms, including any software, techniques and processes used, and any trademarks, logos, images, material, content, designs, information, and other content available on the Platform belongs exclusively to Facilon or is licensed to Facilon. By no means is any proprietary right or license in any intellectual property implied or expressly granted by Facilon to You or any other user of the Platform using the Platform.</p>
            <p>You shall not copy, decompile, reverse engineer, or otherwise attempt to discover any source code, license, use or assign any intellectual property in the Platform, copy any logos, brand names, marketing or branding material or pictures from the Platform, remove any copyright and other proprietary notices contained in any content on the Platform, or use spiders, crawlers or robots for the purpose of accessing the Platform, or any content on the Platform.</p>

            <h3>10. Contact Information</h3>
            <p>If you have any questions about these Terms and Conditions, please contact us at <a href="mailto:reachus@facilonservices.com">reachus@facilonservices.com</a></p>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="modal-footer">
          {hasScrolledToBottom ? (
            <span className="scroll-hint" style={{ color: '#10b981' }}>
              <i className="bi bi-check-circle-fill"></i> You have read the Terms and Conditions.
            </span>
          ) : (
            <span className="scroll-hint" style={{ color: '#be1717' }}>
              <i className="bi bi-arrow-down-circle-fill"></i> Please scroll to the bottom to accept the Terms and Conditions.
            </span>
          )}
          <button
            type="button"
            className="button-1"
            onClick={onAccept}
            disabled={!hasScrolledToBottom}
            style={{
              opacity: hasScrolledToBottom ? 1 : 0.6,
              cursor: hasScrolledToBottom ? 'pointer' : 'not-allowed'
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
