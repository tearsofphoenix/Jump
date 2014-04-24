//
//  VJViewController.m
//  Jump
//
//  Created by Mac003 on 14-4-22.
//  Copyright (c) 2014年 Mac003. All rights reserved.
//

#import "VJViewController.h"

@interface VJViewController ()<UIWebViewDelegate>

@property (weak, nonatomic) IBOutlet UIWebView *webView;

@end

@implementation VJViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    NSFileManager *manager = [NSFileManager defaultManager];
    NSString *libraryPath = NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES)[0];
    
    NSString *targetPath = [libraryPath stringByAppendingPathComponent: @"/Web"];
    if (![manager fileExistsAtPath: targetPath])
    {
        NSError *error = nil;
        NSString *sourcePath = [[[NSBundle mainBundle] resourcePath] stringByAppendingPathComponent: @"/Web"];
        
        [manager copyItemAtPath: sourcePath
                         toPath: targetPath
                          error: &error];
        if (error)
        {
            NSLog(@"%@", error);
        }
        
        error = nil;
        
        NSString *content = [[NSString alloc] initWithContentsOfFile: [[NSBundle mainBundle] pathForResource: @"df"
                                                                                                      ofType: @"js"]
                                                            encoding: NSUTF8StringEncoding
                                                               error: &error];
        if (error)
        {
            NSLog(@"%@", error);
        }

        error = nil;
        
        NSInteger height = [[UIScreen mainScreen] bounds].size.height;
        
        content = [NSString stringWithFormat: content, height];
        [content writeToFile: [targetPath stringByAppendingPathComponent: @"/df.js"]
                  atomically: YES
                    encoding: NSUTF8StringEncoding
                       error: &error];
        if (error)
        {
            NSLog(@"%@", error);
        }
    }
    
    NSURL *url = [NSURL fileURLWithPath: [targetPath stringByAppendingPathComponent: @"/index.html"]];
    
    [_webView setDelegate: self];
    [_webView loadRequest: [NSURLRequest requestWithURL: url]];
}

- (BOOL)prefersStatusBarHidden
{
    return YES;
}

- (BOOL)           webView: (UIWebView *)webView
shouldStartLoadWithRequest: (NSURLRequest *)request
            navigationType: (UIWebViewNavigationType)navigationType
{
    NSLog(@"%@", [request URL]);
    return YES;
}

- (void)webViewDidStartLoad: (UIWebView *)webView
{

}

- (void)webViewDidFinishLoad: (UIWebView *)webView
{

}

- (void)webView: (UIWebView *)webView
didFailLoadWithError: (NSError *)error
{
    NSLog(@"%@", error);
}

@end
