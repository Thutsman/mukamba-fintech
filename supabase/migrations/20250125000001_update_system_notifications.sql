-- Create system_notifications table if it doesn't exist, then update it
CREATE TABLE IF NOT EXISTS system_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'kyc_approved',
    'kyc_rejected',
    'property_approved',
    'property_rejected',
    'inquiry_received',
    'viewing_scheduled',
    'escrow_transaction',
    'payment_update',
    'system_alert'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Update system_notifications table to include payment_update notification type
ALTER TABLE system_notifications 
DROP CONSTRAINT IF EXISTS system_notifications_notification_type_check;

ALTER TABLE system_notifications 
ADD CONSTRAINT system_notifications_notification_type_check 
CHECK (notification_type IN (
    'kyc_approved',
    'kyc_rejected',
    'property_approved',
    'property_rejected',
    'inquiry_received',
    'viewing_scheduled',
    'escrow_transaction',
    'payment_update',
    'system_alert'
));

-- Add metadata column for storing additional notification data
ALTER TABLE system_notifications 
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add target_user_id column for notifications (if not exists)
ALTER TABLE system_notifications 
ADD COLUMN IF NOT EXISTS target_user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Add priority column for notifications (if not exists)
ALTER TABLE system_notifications 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Create index for target_user_id
CREATE INDEX IF NOT EXISTS idx_system_notifications_target_user_id ON system_notifications(target_user_id);

-- Add comments
COMMENT ON COLUMN system_notifications.metadata IS 'Additional data for the notification (JSON)';
COMMENT ON COLUMN system_notifications.target_user_id IS 'User who should receive this notification';
COMMENT ON COLUMN system_notifications.priority IS 'Notification priority level';
