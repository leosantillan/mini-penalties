import React, { useState } from 'react';
import { Button } from './ui/button';
import { Share2, MessageCircle, Twitter, Facebook, X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useLanguage } from '../contexts/LanguageContext';

const ShareButtons = ({ shareText, shareUrl, onShareComplete, showReward = false, customButton = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shared, setShared] = useState(false);
  const { t } = useLanguage();

  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl || window.location.origin);

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
  };

  const handleShare = (platform) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    setShared(true);
    
    // If there's a reward callback, call it after sharing
    if (onShareComplete && showReward) {
      setTimeout(() => {
        onShareComplete();
        setIsOpen(false);
        setShared(false);
      }, 1000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mini Cup',
          text: shareText,
          url: shareUrl || window.location.origin,
        });
        setShared(true);
        if (onShareComplete && showReward) {
          onShareComplete();
          setIsOpen(false);
        }
      } catch (error) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <>
      {customButton ? (
        <div onClick={() => setIsOpen(true)}>
          {customButton}
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          variant={showReward ? "default" : "outline"}
          className={showReward ? "bg-green-600 hover:bg-green-700" : ""}
          size="lg"
        >
          <Share2 className="w-4 h-4 mr-2" />
          {showReward ? t('shareToPlay') : t('share')}
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              {t('shareOn')}
            </DialogTitle>
          </DialogHeader>

          {shared ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-600 mb-2">{t('thankYouSharing')}</h3>
              {showReward && (
                <p className="text-gray-600">{t('unlockedPlays')}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {showReward && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                  <p className="text-green-800 font-semibold">{t('shareReward')}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                {/* WhatsApp */}
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium">WhatsApp</span>
                </button>

                {/* Twitter/X */}
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-black hover:bg-gray-50 transition-all"
                >
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">𝕏</span>
                  </div>
                  <span className="text-sm font-medium">X</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Facebook className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium">Facebook</span>
                </button>
              </div>

              {/* Native Share (mobile) */}
              {navigator.share && (
                <Button
                  onClick={handleNativeShare}
                  variant="outline"
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {t('moreOptions')}
                </Button>
              )}

              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                className="w-full"
              >
                {t('cancel')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShareButtons;
