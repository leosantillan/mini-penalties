import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Clock, Play } from 'lucide-react';
import { usePlayLimit } from '../contexts/PlayLimitContext';

const AdModal = ({ isOpen, onClose, onCancel }) => {
  const { watchAd, adViewsUsed, maxAdViews } = usePlayLimit();
  const [adWatched, setAdWatched] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isOpen) {
      setAdWatched(false);
      setCountdown(5);

      // Load Google AdSense ad
      try {
        if (window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (error) {
        console.error('Error loading ad:', error);
      }

      // Simulate ad watch countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setAdWatched(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const handleContinue = () => {
    if (adWatched) {
      watchAd();
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-2xl" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Watch a Short Ad to Continue Playing</DialogTitle>
          <DialogDescription>
            You've used your free plays. Watch a short ad to unlock 2 more plays!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ad View Counter */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ad Views Today</p>
                <p className="text-2xl font-bold text-blue-600">
                  {adViewsUsed} / {maxAdViews}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Will Unlock</p>
                <p className="text-2xl font-bold text-green-600">2 Plays</p>
              </div>
            </div>
          </div>

          {/* Ad Container */}
          <div className="bg-gray-100 rounded-lg p-8 min-h-[300px] flex items-center justify-center relative">
            {!adWatched ? (
              <div className="text-center">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4 animate-pulse">
                    <Clock className="w-10 h-10 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Advertisement</h3>
                <p className="text-gray-600 mb-4">Please wait {countdown} seconds...</p>
                <div className="w-48 h-2 bg-gray-300 rounded-full mx-auto overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-1000"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  />
                </div>
                
                {/* Google AdSense Ad Slot */}
                <div className="mt-6">
                  <ins
                    className="adsbygoogle"
                    style={{ display: 'block' }}
                    data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                    data-ad-slot="XXXXXXXXXX"
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                  ></ins>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                    <Play className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Ready to Play!</h3>
                <p className="text-gray-600">You've unlocked 2 more plays</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleContinue}
              disabled={!adWatched}
              className="flex-1"
              size="lg"
            >
              {adWatched ? 'Continue Playing' : `Wait ${countdown}s...`}
            </Button>
          </div>

          {/* Info */}
          <div className="text-center text-sm text-gray-500">
            <p>
              After {maxAdViews} ad views ({maxAdViews * 2} more plays), you'll need to return tomorrow
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdModal;