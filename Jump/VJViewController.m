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
	// Do any additional setup after loading the view, typically from a nib.
    
    NSURL *url = [[NSBundle mainBundle] URLForResource: @"index"
                                         withExtension: @"html"
                                          subdirectory: @"Web"];
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
